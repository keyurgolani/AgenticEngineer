"use client"

import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useUIStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface Module {
    slug: string
    title: string
    day: number
}

interface ModuleSidebarProps {
    defaultWeek: string
    weekNumbers: number[]
    weeklyModules: Record<string, Module[]>
    currentSlug: string
}

export function ModuleSidebar({ defaultWeek, weekNumbers, weeklyModules, currentSlug }: ModuleSidebarProps) {
    const toggleSidebar = useUIStore((state) => state.toggleSidebar)
    
    // Helper to safely format titles
    const safeTitle = (t?: string) => (t || "").split(": ")[1] || t || ""

    const handleLinkClick = () => {
        // On mobile (or if explicitly desired), close sidebar on nav
        if (window.innerWidth < 1024) { // lg breakpoint
             // Check state directly to avoid toggle flip-flop if there's lag, though toggle is atomic.
             // Since we only have toggle, we rely on the fact that if user clicked a link in sidebar, it MUST be open.
             toggleSidebar()
        }
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-2">
            <Accordion type="single" collapsible defaultValue={defaultWeek} className="w-full pb-10">
                {weekNumbers.map(week => (
                    <AccordionItem key={week} value={week.toString()} className="border-b-border">
                        <AccordionTrigger className="hover:no-underline py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">
                            Week {week}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-1 pt-1 pb-2">
                                {weeklyModules[week.toString()].map((m) => (
                                    <Link 
                                        key={m.slug} 
                                        href={`/modules/${m.slug}`}
                                        onClick={handleLinkClick}
                                    >
                                        <div className={cn(
                                            "px-3 py-2 rounded-md text-sm transition-colors cursor-pointer flex gap-3",
                                            m.slug === currentSlug 
                                                ? "bg-secondary text-foreground font-medium" 
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        )}>
                                            <span className="font-mono opacity-50 text-xs mt-0.5">{m.day.toString().padStart(2, '0')}</span>
                                            <span className="line-clamp-1">{safeTitle(m.title)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
