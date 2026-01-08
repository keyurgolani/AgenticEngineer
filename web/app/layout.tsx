import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Roboto, Fira_Code, Manrope, Outfit, IBM_Plex_Mono, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Sans Serif Fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

// Monospace Fonts
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const fira = Fira_Code({ subsets: ["latin"], variable: "--font-fira" });
const ibmPlex = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-ibm" });
const sourceCode = Source_Code_Pro({ subsets: ["latin"], variable: "--font-source" });

export const metadata: Metadata = {
  title: "Agentic Systems Engineering",
  description: "Master Course for AI Engineers",
};

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/Header"
import { NotesModalWrapper } from "@/components/features/notes/NotesModalWrapper"
import { SearchWrapper } from "@/components/features/search/SearchWrapper"
import { KeyboardShortcutsProvider } from "@/components/features/KeyboardShortcuts"
import { CommandPalette } from "@/components/features/CommandPalette"
import { getAllModules } from "@/lib/modules"
import { FontProvider } from "@/components/providers/FontProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const modules = getAllModules()
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased text-foreground selection:bg-zinc-800 selection:text-zinc-100",
        inter.variable,
        roboto.variable,
        manrope.variable,
        outfit.variable,
        jetbrains.variable,
        fira.variable,
        ibmPlex.variable,
        sourceCode.variable
      )}>
        <FontProvider />
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark", "bright", "black"]}
            disableTransitionOnChange
          >
            <KeyboardShortcutsProvider />
            <Header />
            <main className="min-h-screen pb-20">
                {children}
            </main>
            <NotesModalWrapper />
            <SearchWrapper modules={modules} />
            <SearchWrapper modules={modules} />
            <CommandPalette />
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
