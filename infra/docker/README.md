# Docker Deployment

This directory contains Docker configuration for the Agentic Engineer platform.

## Files

- `Dockerfile` - Multi-stage build for production Next.js app
- `docker-compose.yml` - Production deployment using pre-built images
- `docker-compose.dev.yml` - Development deployment with local build
- `.dockerignore` - Files excluded from Docker build context
- `.env.example` - Example environment variables

## Quick Start

### Production (using pre-built images)

```bash
cd infra/docker
docker compose up -d
```

### Development (build locally)

```bash
cd infra/docker
docker compose -f docker-compose.dev.yml up --build
```

## Environment Variables

| Variable | Description      | Default    |
| -------- | ---------------- | ---------- |
| PORT     | Application port | 3000       |
| NODE_ENV | Node environment | production |

## Accessing the Application

Once running, access the application at: http://localhost:3000

## Building Manually

```bash
# From repository root
docker build -f infra/docker/Dockerfile -t agentic-engineer .
docker run -p 3000:3000 agentic-engineer
```
