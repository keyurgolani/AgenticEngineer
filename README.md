# Agentic Engineer

Educational web platform teaching a 30-day course on building production-grade AI agent systems. Transform into an "Agentic Architect" using LangGraph, MCP, and multi-agent patterns.

## Features

- 30+ MDX learning modules organized by week
- 5 capstone projects: Deep Research, K8s Operator, Local Analyst, Refactorer, Forensics Swarm
- Interactive content: code examples, Mermaid diagrams, exercises
- User notes with local storage persistence
- Progress tracking per module
- Dark/light theme support

## Tech Stack

- Next.js 16.1 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- MDX for content

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Development

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
cd web
npm run build
npm start
```

## Docker

### Using Pre-built Images

```bash
# From Docker Hub
docker pull keyurgolani/agentic-engineer:latest
docker run -p 3000:3000 keyurgolani/agentic-engineer:latest

# From GitHub Container Registry
docker pull ghcr.io/keyurgolani/agenticengineer:latest
docker run -p 3000:3000 ghcr.io/keyurgolani/agenticengineer:latest
```

### Using Docker Compose

```bash
# Production (pre-built images)
cd infra/docker
docker compose up -d

# Development (local build)
cd infra/docker
docker compose -f docker-compose.dev.yml up --build
```

## Project Structure

```
├── web/                    # Next.js application
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   ├── content/modules/    # MDX course content
│   └── lib/                # Utilities and state
├── infra/docker/           # Docker configuration
└── .github/workflows/      # CI/CD pipelines
```

## License

MIT
