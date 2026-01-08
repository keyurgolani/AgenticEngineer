"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TOCHeading {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCHeading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Collect all h2 and h3 headings from the rendered article
    const elements = Array.from(document.querySelectorAll("article h2, article h3"))
    const mapped: TOCHeading[] = elements
      .filter((elem) => elem.id && elem.id.trim() !== "") // Only include headings with valid IDs
      .map((elem) => ({
        id: elem.id,
        text: (elem as HTMLElement).innerText,
        level: Number(elem.tagName.substring(1)),
      }))
    setTimeout(() => setHeadings(mapped), 0)

    // Intersection Observer to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0% 0% -80% 0%" }
    )

    elements.forEach((elem) => observer.observe(elem))
    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="hidden xl:block w-72 sticky top-24 max-h-[calc(100vh-6rem)] h-fit overflow-y-auto border border-border/50 rounded-xl bg-muted/10 p-5">
      <h4 className="mb-4 text-sm font-semibold tracking-tight uppercase text-muted-foreground/80">On This Page</h4>
      <ul className="space-y-3 text-sm">
        {headings.map((heading, index) => (
          <li key={`${heading.id}-${index}`}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block transition-colors hover:text-foreground",
                activeId === heading.id
                  ? "text-foreground font-medium border-l-2 border-primary -ml-4 pl-[14px]"
                  : "text-muted-foreground"
              )}
              style={{ paddingLeft: heading.level === 3 ? "1rem" : undefined }}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                })
                setActiveId(heading.id)
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
