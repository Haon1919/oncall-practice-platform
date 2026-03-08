import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const containerId = searchParams.get('containerId');

    if (!containerId) {
      return NextResponse.json({ error: "containerId is required" }, { status: 400 });
    }

    const container = docker.getContainer(containerId);
    
    // Fetch logs
    const logsBuffer = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100, // Get last 100 lines
      timestamps: true
    });

    // Dockerode returns a multiplexed stream buffer. We need to parse it.
    // The first 8 bytes of each frame contain the header (type, length).
    // For simplicity in this prototype, we'll just convert the buffer to string
    // and do some basic cleanup, though it might contain some binary artifacts.
    // A robust solution would parse the multiplexed stream properly.
    
    // Simple cleanup: remove non-printable characters (except newlines/tabs)
    const rawLogs = logsBuffer.toString('utf8');
    const cleanLogs = rawLogs.replace(/[^\x20-\x7E\n\t]/g, '');

    return NextResponse.json({ logs: cleanLogs });

  } catch (error: any) {
    console.error("Logs error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}