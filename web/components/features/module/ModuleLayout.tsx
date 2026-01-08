"use client"

import React, { useEffect } from "react"
import { useUIStore } from "@/lib/store"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Smartphone, MonitorSmartphone, Monitor } from "lucide-react"

interface ModuleLayoutProps {
    sidebarContent: React.ReactNode
    children: React.ReactNode
}

export function ModuleLayout({ sidebarContent, children }: ModuleLayoutProps) {
    const { 
        contentWidth, 
        setContentWidth,
        isSidebarOpen: isSidebarVisible,  // Alias to keep logic minimal change
    } = useUIStore()
    
    // Fix for hydration mismatch or flash
    const [mounted, setMounted] = React.useState(false)

    // eslint-disable-next-line
    useEffect(() => setMounted(true), [])

    if (!mounted) return null

    const showSidebar = isSidebarVisible

    return (
        <div className="flex min-h-screen transition-colors duration-300">
             {/* Dynamic Sidebar */}
             {/* Mobile Overlay Backdrop */}
             {showSidebar && (
                 <div 
                    className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden animate-in fade-in"
                    onClick={() => useUIStore.getState().toggleSidebar()}
                    aria-hidden="true"
                 />
             )}

             {/* Dynamic Sidebar */}
             <aside className={cn(
                "flex flex-col border-r border-border fixed left-0 bg-background/95 backdrop-blur-xl z-30 transition-all duration-300 ease-in-out overflow-hidden shadow-2xl lg:shadow-none",
                // Top positioning: Always below header now (top-14) since Header persists in Zen Mode (mostly) or we want consistent layout.
                // Actually if Zen Mode is active, we might want to hide sidebar completely.
                "top-14 h-[calc(100vh-3.5rem)]",
                showSidebar ? "w-72 translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 border-r-0"
             )}>
                {sidebarContent}
             </aside>

             {/* Floating Width Controls (Zen Mode) */}
             {!showSidebar && (
                <div className="fixed top-20 left-6 z-40 animate-in fade-in slide-in-from-left-4 duration-300 hidden lg:block">
                    <div className="flex flex-col items-center gap-2 bg-background/80 backdrop-blur border border-border/40 p-1.5 rounded-full shadow-lg">
                        <Button 
                            variant={contentWidth === 'narrow' ? "secondary" : "ghost"} 
                            size="icon" 
                            onClick={() => setContentWidth('narrow')}
                            className="h-8 w-8 rounded-full"
                            title="Narrow Width"
                        >
                            <Smartphone className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant={contentWidth === 'standard' ? "secondary" : "ghost"} 
                            size="icon" 
                            onClick={() => setContentWidth('standard')}
                            className="h-8 w-8 rounded-full"
                            title="Standard Width"
                        >
                            <MonitorSmartphone className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant={contentWidth === 'wide' ? "secondary" : "ghost"} 
                            size="icon" 
                            onClick={() => setContentWidth('wide')}
                            className="h-8 w-8 rounded-full"
                            title="Wide Width"
                        >
                            <Monitor className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
             )}

             {/* Main Content Area */}
             <main className={cn(
                 "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out pt-14 max-w-[100vw] overflow-x-hidden", // Always pt-14 for header
                 // Left padding matches sidebar width if visible
                 showSidebar ? "lg:pl-72" : "lg:pl-0"
             )}>

                 {/* Content Wrapper */}
                 <div className={cn(
                     "flex-1 px-4 lg:px-12 xl:px-16 pt-4 pb-12 mx-auto transition-all duration-500 ease-in-out w-full overflow-x-hidden",
                     contentWidth === 'narrow' ? "max-w-4xl" : 
                     contentWidth === 'standard' ? "max-w-[90%] xl:max-w-[95%] 2xl:max-w-[1600px]" : 
                     "max-w-full" // Wide fills everything
                 )}>
                     {children}
                 </div>
             </main>
        </div>
    )
}
