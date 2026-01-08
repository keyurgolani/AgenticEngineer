# Agentic Engineer

🌐 **Live Site Coming Soon**: [agenticengineer.keyurgolani.name](https://agenticengineer.keyurgolani.name)

**The Comprehensive 30-Day Course on Building Production-Grade AI Agents.**

From "Hello World" to "Autonomous Swarms" — Learn to architect, build, and deploy intelligent agentic systems using LangGraph, MCP, Vector Databases, and Agentic Design Patterns.

## 🚀 Features

- **30-Day Curriculum**: Structured modules covering Foundations, Tool Use, Orchestration, Production Engineering, and Advanced Architectures.
- **5 Capstone Projects**:
  - **Deep Research Algorithm**: Recursive planner/researcher/writer graph.
  - **K8s Evaluation Operator**: Autonomous infrastructure debugger.
  - **Local-First Privacy Analyst**: Secure, sandboxed data analysis.
  - **Refactoring Swarm**: LibCST-based automated code maintenance.
  - **Forensics Team**: Multi-agent security investigation.
- **Interactive Learning**:
  - **Live Code Blocks**: Syntax highlighting, copy-to-clipboard, file tree views.
  - **Visualizations**: Interactive diagrams (Mermaid, Transformers) and rich illustrations.
  - **Playgrounds**: Real-time token flow and step-simulation components.
- **Production Ready**:
  - **Full SEO**: JSON-LD Structured Data, Dynamic OpenGraph Images, Sitemap.
  - **PWA**: Installable on mobile/desktop.
  - **Performance**: Optimized Web Vitals and Best Practices.
  - **Themeable**: Dark/Light modes with high-contrast options.

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1 (App Router, Turbopack)
- **Language**: TypeScript 5, React 19
- **Styling**: Tailwind CSS 4, shadcn/ui, Framer Motion
- **Content**: MDX, rehype-pretty-code, shiki
- **Testing**: Vitest, React Testing Library
- **Infrastructure**: Docker, Vercel Ready

## 🏁 Getting Started

### Prerequisites

- Node.js 22+
- npm

### Local Development

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start learning.

### Production Build

```bash
cd web
npm run build
npm start
```

## 📦 Deployment

### Vercel (Recommended)

This project is optimized for Vercel.

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Set the Root Directory to `web`.
4. Deploy.

### Docker

#### Using Pre-built Images

```bash
# From Docker Hub
docker pull keyurgolani/agentic-engineer:latest
docker run -p 3000:3000 keyurgolani/agentic-engineer:latest
```

#### Local Docker Build

```bash
cd infra/docker
docker compose -f docker-compose.dev.yml up --build
```

## 📂 Project Structure

```text
├── web/
│   ├── app/                # Next.js App Router
│   │   ├── (marketing)/    # Home & Landing Pages
│   │   ├── modules/        # Course Content Pages
│   │   └── api/            # API Routes
│   ├── components/         # React UI Library (shadcn)
│   ├── content/modules/    # MDX Course Material (Day 01-31)
│   ├── lib/                # Core Utilities
│   └── public/             # Static Assets (Images, Illustrations)
├── infra/                  # Infrastructure (Docker, K8s)
└── .github/                # CI/CD Workflows
```

## 📜 License

MIT
