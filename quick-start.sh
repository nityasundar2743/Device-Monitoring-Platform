#!/bin/bash

# Device Monitoring Platform - Quick Start Script
# This script sets up the entire platform using Docker Compose

set -e

echo "🚀 Starting Device Monitoring Platform Setup..."
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Set Docker Compose command
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "✅ Docker and Docker Compose are available"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data/mysql
mkdir -p logs

# Set up environment files
echo "🔧 Setting up environment configuration..."

# Client environment
if [ ! -f "Client/.env" ]; then
    cp Client/.env.example Client/.env
    echo "📝 Created Client/.env from template"
    echo "   Please edit Client/.env to configure your USER_ID"
fi

echo "🐳 Building and starting services..."
echo "This may take a few minutes on first run..."

# Build and start services
$DOCKER_COMPOSE up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
echo "📦 Waiting for database..."
sleep 10

# Wait for server to be ready
echo "🔧 Waiting for API server..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/devices/logs > /dev/null 2>&1; then
        echo "✅ API server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  API server is taking longer than expected to start"
        echo "   Check logs with: $DOCKER_COMPOSE logs server"
    fi
    sleep 2
done

# Wait for dashboard to be ready
echo "🎨 Waiting for dashboard..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Dashboard is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  Dashboard is taking longer than expected to start"
        echo "   Check logs with: $DOCKER_COMPOSE logs dashboard"
    fi
    sleep 2
done

echo ""
echo "🎉 Device Monitoring Platform is now running!"
echo "=============================================="
echo ""
echo "📊 Dashboard:      http://localhost:3000"
echo "🔧 API Server:     http://localhost:8000"
echo "📚 API Docs:       http://localhost:8000/docs"
echo "💾 Database:       localhost:3306 (root/rootpassword)"
echo ""
echo "🖥️  To monitor your host machine:"
echo "   1. cd Client"
echo "   2. Edit .env file with your USER_ID"
echo "   3. pip install -r requirements.txt"
echo "   4. python client.py"
echo ""
echo "📋 Useful commands:"
echo "   View logs:       $DOCKER_COMPOSE logs -f"
echo "   Stop services:   $DOCKER_COMPOSE down"
echo "   Restart:         $DOCKER_COMPOSE restart"
echo "   View status:     $DOCKER_COMPOSE ps"
echo ""

# Check service status
echo "🔍 Service Status:"
$DOCKER_COMPOSE ps

echo ""
echo "✨ Setup complete! Happy monitoring! ✨"