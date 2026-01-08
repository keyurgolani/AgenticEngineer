"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Lightbulb, StickyNote, Home, PanelLeftClose, PanelLeftOpen, Search, Command, Link as LinkIcon } from "lucide-react"
import { useUIStore } from "@/lib/store"
import { StreakDisplay } from "@/components/custom/ProgressDisplay"

import { cn } from "@/lib/utils"
// import { ModeToggle } from "@/components/mode-toggle" // Removed
import { SettingsDialog } from "./SettingsDialog"

export function Header() {
  const pathname = usePathname()
  const { openNotes, isSidebarOpen, toggleSidebar, openSearch } = useUIStore()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/modules", label: "Course Work", icon: BookOpen }, // Fixed link to generic modules root or keep specific? Keeping user original was day-00. Let's redirect to /modules if it exists or keep day-00. User had /modules/day-00-course-setup.
    { href: "/projects", label: "Project Ideas", icon: Lightbulb },
    { href: "/resources", label: "Resources", icon: LinkIcon },
  ]
  
  // Update nav item href to point to first module if needed, or keep as is.
  // Correction: User had specific link. Let's keep it but maybe make it dynamic later.
  const courseLink = navItems[1]
  courseLink.href = "/modules/day-00-course-setup" 



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
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80 flex items-center gap-2",
                  pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline-block">{item.label}</span>
                {item.label === "Course Work" && (
                   <div className="ml-1 scale-90 origin-left">
                     <StreakDisplay compact />
                   </div>
                )}
              </Link>
            ))}
          </nav>
        </div>
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
