import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import JsonLd from "@/components/seo/JsonLd";

// Sans Serif Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

// Monospace Fonts
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: {
    default: "Agentic Engineer | Master AI Agent Architecture",
    template: "%s | Agentic Engineer"
  },
  description: "A 30-day comprehensive course on building production-ready AI agents. From basics to advanced swarms, LangGraph, CrewAI, and beyond.",
  keywords: ["AI Agents", "LLM", "LangGraph", "CrewAI", "TypeScript", "Python", "Course"],
  authors: [{ name: "Agentic Engineer Team" }],
  creator: "Agentic Engineer",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://agenticengineer.keyurgolani.name',
    title: 'Agentic Engineer',
    description: 'Master the art of building autonomous AI agents.',
    siteName: 'Agentic Engineer',
    images: [
      {
        url: '/og?title=Agentic%20Engineer&subtitle=The%20Complete%20Course',
        width: 1200,
        height: 630,
        alt: 'Agentic Engineer Course',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agentic Engineer',
    description: 'Master the art of building autonomous AI agents.',
    images: ['/og?title=Agentic%20Engineer&subtitle=The%20Complete%20Course'],
  },
  icons: {
    icon: "/favicon.ico",
  },
};
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { NotesModalWrapper } from "@/components/features/notes/NotesModalWrapper"
import { SearchWrapper } from "@/components/features/search/SearchWrapper"
import { KeyboardShortcutsProvider } from "@/components/features/KeyboardShortcuts"
import { CommandPalette } from "@/components/features/CommandPalette"
import { getAllModules } from "@/lib/modules"

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Agentic Engineer",
  "description": "Master the art of building autonomous AI agents with LLMs, weird architectures, and modern production engineering.",
  "provider": {
    "@type": "Organization",
    "name": "Agentic Engineer",
    "sameAs": "https://agenticengineer.keyurgolani.name"
  },
  "educationalLevel": "Intermediate",
  "programmingLanguage": ["TypeScript", "Python"],
  "teaches": ["LLMs", "AI Agents", "ReAct", "RAG", "Production Engineering"]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const modules = getAllModules()
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, jetbrains.variable, outfit.variable)}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <JsonLd data={courseSchema} />
            <KeyboardShortcutsProvider />
            <Header />
            <main className="min-h-screen pb-20">
                {children}
            </main>
            <NotesModalWrapper />
            <SearchWrapper modules={modules} />
            <CommandPalette />
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
