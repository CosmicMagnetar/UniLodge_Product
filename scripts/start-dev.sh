#!/bin/bash

# UniLodge - Start all services script

echo "🚀 Starting UniLodge services..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start all services in parallel
echo "▶️  Starting frontend, backend, and AI engine..."

npm run dev &

# Wait for all processes
wait

echo "❌ Services stopped"
