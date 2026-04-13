# Docker Utilities and Scripts

This directory contains Docker-related utilities and scripts for the UniLodge application.

## Files

- `docker-compose.yml` - Multi-container orchestration (in root)
- `Dockerfile.backend` - Backend service container definition
- `Dockerfile.frontend` - Frontend service container definition
- `Dockerfile.ai-engine` - AI engine service container definition

## Usage

```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up backend
docker-compose up frontend
docker-compose up ai-engine

# Build images
docker-compose build

# Stop services
docker-compose down
```

## Services

- **Backend**: Node.js/Express API server on port 5000
- **Frontend**: React/Next.js application on port 3000
- **AI Engine**: Python AI service on port 8000
- **MongoDB**: Document database on port 27017 (optional)

## Network

All services communicate through the `unilodge-network` Docker network.
