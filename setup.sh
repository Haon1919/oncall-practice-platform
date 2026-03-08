#!/bin/bash

echo "Checking for Docker..."

if ! command -v docker &> /dev/null
then
    echo "Docker could not be found."
    echo "This application requires Docker to run and to generate practice environments."
    echo ""
    echo "Please install Docker Desktop for your operating system:"
    echo "Mac: https://docs.docker.com/desktop/install/mac-install/"
    echo "Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "Linux: https://docs.docker.com/desktop/install/linux-install/"
    echo ""
    echo "After installing, please start Docker Desktop and run this script again."
    exit 1
fi

echo "Docker is installed."

if ! docker info &> /dev/null
then
    echo "Docker is installed but the daemon is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "Docker is running."
echo "You are ready to start the On-Call Practice Platform!"
echo "Run 'docker-compose up --build' to start the application."
