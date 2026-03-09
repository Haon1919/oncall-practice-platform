import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function POST(req: Request) {
  try {
    const { appName, description, cloudProvider, incidentId, apiKey, model } = await req.json();

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set and no API key was provided" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: keyToUse });
    const modelToUse = model || 'gemini-2.5-flash';

    // 1. Generate the buggy application code
    const codePrompt = `
      You are an expert software engineer. Create a simple Node.js Express application based on this description: "${description}".
      
      CRITICAL INSTRUCTION: You MUST intentionally introduce a logical bug or configuration error into the application that would cause a production issue (e.g., a memory leak, an unhandled promise rejection that crashes the server, a bad database query simulation that hangs, incorrect routing, or a subtle logic error).
      
      The application MUST run on port 8080.
      
      Return ONLY a JSON object with the following structure, no markdown formatting, no explanation:
      {
        "files": {
          "package.json": "content here",
          "server.js": "content here",
          "Dockerfile": "content here"
        },
        "bugDescription": "A brief, secret description of the bug you introduced (for the AI assistant to know)."
      }
      
      The Dockerfile should use node:18-alpine, copy files, run npm install, expose 8080, and start server.js.
    `;

    const codeResponse = await ai.models.generateContent({
      model: modelToUse,
      contents: codePrompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const generatedData = JSON.parse(codeResponse.text || "{}");
    
    if (!generatedData.files || !generatedData.files['server.js']) {
      throw new Error("Failed to generate application code structure.");
    }

    // 2. Generate the support ticket
    const ticketPrompt = `
      You are a user of an application called "${appName}". 
      The application is supposed to: "${description}".
      However, it currently has this bug: "${generatedData.bugDescription}".
      
      Write a realistic, slightly frustrated support ticket email from the perspective of a user experiencing this issue. 
      Do NOT mention the technical details of the bug (like "memory leak" or "unhandled promise"), just describe the symptoms you are experiencing as a user (e.g., "the page is loading forever", "I get a 500 error when I click X", "my data isn't saving").
      
      Return ONLY the body of the email as plain text.
    `;

    const ticketResponse = await ai.models.generateContent({
      model: modelToUse,
      contents: ticketPrompt,
    });

    const ticketBody = ticketResponse.text;

    // 3. Write files to a temporary directory
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `oncall-${incidentId}-`));
    
    for (const [filename, content] of Object.entries(generatedData.files)) {
      await fs.writeFile(path.join(tmpDir, filename), content as string);
    }

    // 4. Build Docker Image
    const imageName = `oncall-app-${incidentId.toLowerCase()}`;
    
    // We need to pack the directory into a tar stream for Dockerode
    // For simplicity in this Next.js API route, we'll use a shell command via child_process
    // since Dockerode's buildImage expects a tar stream which is tricky to construct manually here without extra deps.
    const { execSync } = require('child_process');
    
    try {
      execSync(`docker build -t ${imageName} .`, { cwd: tmpDir, stdio: 'ignore' });
    } catch (buildError) {
      console.error("Docker build failed:", buildError);
      throw new Error("Failed to build Docker image for the generated application.");
    }

    // 5. Run Docker Container
    const port = Math.floor(Math.random() * (65535 - 1024) + 1024); // Random port
    
    const container = await docker.createContainer({
      Image: imageName,
      name: `oncall-container-${incidentId}`,
      HostConfig: {
        PortBindings: {
          '8080/tcp': [{ HostPort: port.toString() }]
        }
      },
      ExposedPorts: {
        '8080/tcp': {}
      }
    });

    await container.start();

    // Clean up tmp dir
    await fs.rm(tmpDir, { recursive: true, force: true });

    return NextResponse.json({
      containerId: container.id,
      port,
      ticketBody,
      bugDescription: generatedData.bugDescription
    });

  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
  }
}
