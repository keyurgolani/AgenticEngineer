# Agentic Engineer

🌐 **Live Site**: [agenticengineer.keyurgolani.name](https://agenticengineer.keyurgolani.name)

**The Comprehensive 3-Month Course on Building Production-Grade AI Agents.**

From "Hello World" to "Autonomous Swarms" — Learn to architect, build, and deploy intelligent agentic systems using LangGraph, MCP, Vector Databases, and Agentic Design Patterns.

## 🎯 What's New in v1.2

- **Expanded to 90 Days**: Complete 3-month curriculum with 49 modules covering foundations through advanced architectures
- **12 Real-World Projects**: 3 major capstone projects, 4 specialized projects, and 5 mini-projects
- **40+ Interactive Components**: Hands-on playgrounds, simulators, calculators, and visualizers
- **Enhanced Learning Tools**: ACE Playbook Visualizer, Reasoning Model Comparison, MCP Server Builder, and more
- **Git Hooks**: Pre-commit and pre-push validation to catch issues early
- **Improved Navigation**: Syllabus page, enhanced module filtering, and progress tracking

## 🚀 Features

- **90-Day Curriculum (3 Months)** - 49 comprehensive modules:
  - **Month 1 (Days 0-30)**: Foundations & Core Concepts
    - LLM fundamentals, prompt engineering, structured outputs
    - Single-agent systems with LangGraph
    - Context engineering, RAG, and memory systems
    - Extended thinking and reasoning models
  - **Month 2 (Days 31-60)**: Multi-Agent Systems & Production Engineering
    - Orchestration patterns and agent coordination
    - MCP (Model Context Protocol) standard
    - Security, sandboxing, and prompt injection defense
    - Observability, monitoring, and debugging
  - **Month 3 (Days 61-90)**: Advanced Architectures & Mastery
    - Autonomous loops and self-improving agents
    - Swarm intelligence and multi-agent collaboration
    - Enterprise deployment and open-source ecosystems
    - Benchmarking, ML analogies, and future trends
- **12 Hands-On Projects** - Build production-ready systems:
  - **3 Major Capstone Projects**:
    - Deep Research Agent (multi-source research with citations)
    - K8s Operator Agent (autonomous Kubernetes management)
    - AgentOS Ecosystem (complete agentic operating system)
  - **4 Specialized Projects**:
    - Local Privacy Analyst (on-device AI for sensitive data)
    - Code Refactoring Agent (automated code improvement)
    - Financial Forensics Swarm (fraud detection system)
    - Domain-Specific Watchdog (custom monitoring agent)
  - **5 Mini-Projects**:
    - Prompt Library Service (template management)
    - Memory Service (persistent agent memory)
    - RAG Service (retrieval-augmented generation)
    - LLM Router (intelligent model selection)
    - Research Agent (automated information gathering)
- **Interactive Learning** - 40+ hands-on components:
  - **Live Code Blocks**: Syntax highlighting with shiki, copy-to-clipboard, file tree views
  - **Interactive Playgrounds**:
    - Token Calculator & Budget Allocator
    - Prompt Builder & Template Library
    - Schema Validator & Anonymization Playground
    - Context Compression & Fetcher Simulator
    - MCP Server Builder & Protocol Comparison
  - **Simulators & Explorers**:
    - Memory System Simulator
    - RAG Pipeline Simulator
    - K8s Operator Simulator
    - Investigation & Behavior Simulators
    - Fraud Graph & Architecture Explorers
  - **Visualizations**:
    - Mermaid diagrams for workflows
    - Transformer & reasoning process animations
    - Token flow and agent architecture diagrams
    - Interactive comparison tables
  - **Learning Tools**:
    - ACE Playbook Visualizer (self-improving agents)
    - Reasoning Model Comparison
    - LLMs.txt Generator
    - Skill Discovery Demo
    - Risk Score & Benchmark Calculators
- **Production Ready**:
  - **Full SEO**: JSON-LD Structured Data, Dynamic OpenGraph Images, Sitemap, Robots.txt
  - **PWA**: Installable on mobile/desktop with offline support
  - **Performance**: Optimized Web Vitals, static generation for 49 modules
  - **Themeable**: Dark/Light modes with system preference detection
  - **Accessibility**: ARIA labels, keyboard navigation, screen reader support
  - **Developer Experience**:
    - Git hooks for pre-commit/pre-push validation
    - Comprehensive test coverage with Vitest
    - ESLint configuration for code quality
    - Docker support for containerized deployment

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

### Git Hooks Setup (Recommended)

To enable pre-commit and pre-push validation hooks:

```bash
git config core.hooksPath .githooks
```

This will automatically run linting, tests, and builds before commits/pushes to catch issues early.

### Production Build

```bash
cd web
npm run build
npm start
```

### Available Scripts

All commands run from the `web/` directory:

```bash
npm run dev          # Start development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests (single run)
npm run test:watch   # Run tests in watch mode
npm run verify       # Verify build integrity
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
├── web/                        # Next.js Application
│   ├── app/                    # Next.js App Router
│   │   ├── modules/            # Course Module Pages (49 modules)
│   │   │   └── [slug]/         # Dynamic route for day-XX-topic
│   │   ├── syllabus/           # Course syllabus overview
│   │   ├── projects/           # Projects showcase
│   │   ├── notes/              # User notes feature
│   │   └── og/                 # OpenGraph image generation
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── custom/             # Course-specific components
│   │   │   ├── animations/     # Animated visualizations (8 components)
│   │   │   └── interactive/    # Interactive tools (40+ components)
│   │   │       ├── builders/   # MCP Server, Prompt Template builders
│   │   │       ├── calculators/# Token, Cost, Risk, Benchmark calculators
│   │   │       ├── comparisons/# Vector vs Graph memory, etc.
│   │   │       ├── detectors/  # Fraud detection demos
│   │   │       ├── explorers/  # Architecture, Memory, K8s explorers
│   │   │       ├── helpers/    # Career path, compliance tools
│   │   │       ├── playgrounds/# Security, compression playgrounds
│   │   │       ├── simulators/ # Memory, RAG, K8s simulators
│   │   │       └── visualizers/# Hybrid search, trace visualizers
│   │   ├── features/           # Search, notes, command palette
│   │   └── layout/             # Header, navigation, footer
│   ├── content/modules/        # MDX Course Content (Days 00-90)
│   ├── lib/                    # Core utilities and hooks
│   ├── public/images/          # 150+ course illustrations
│   └── hooks/                  # Custom React hooks
├── .githooks/                  # Git hooks for validation
│   ├── pre-commit              # Lint + test before commit
│   └── pre-push                # Lint + test + build before push
├── infra/docker/               # Docker configuration
└── .github/workflows/          # CI/CD (build, test, publish)
```

## 📜 License

MIT
