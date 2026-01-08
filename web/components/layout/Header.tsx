"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, PanelLeftClose, PanelLeftOpen, Search, Command, StickyNote } from "lucide-react"
import { useUIStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { SettingsDialog } from "./SettingsDialog"

export function Header() {
  const pathname = usePathname()
  const { openNotes, isSidebarOpen, toggleSidebar, openSearch } = useUIStore() 



  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="mx-auto flex h-14 w-full items-center px-4 md:px-8">
        <div className="mr-4 flex items-center gap-4">
          {pathname?.startsWith("/modules/") && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground flex h-8 w-8"
              title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
          )}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Agentic Engineer
            </span>
          </Link>
        </div>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/modules"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith("/modules")
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Modules
          </Link>
          <Link
            href="/notes"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith("/notes")
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Notes
          </Link>
          <Link
            href="/resources"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith("/resources")
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Resources
          </Link>
           <Link
            href="/projects"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith("/projects")
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Projects
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Search Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={openSearch}
            className="gap-2 hidden sm:flex h-8 text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
          <Button variant="ghost" size="icon" onClick={openSearch} className="sm:hidden h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>

          {/* Module Controls */}



          <Button variant="outline" size="sm" onClick={openNotes} className="gap-2 hidden md:flex h-8">
            <StickyNote className="h-4 w-4" />
            <span>Notes</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>N
            </kbd>
          </Button>
          <Button variant="ghost" size="icon" onClick={openNotes} className="md:hidden h-8 w-8">
             <StickyNote className="h-4 w-4" />
          </Button>




          <SettingsDialog />
        </div>
      </div>
    </header>
  )
}
