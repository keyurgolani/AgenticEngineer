"use client"

import { useEffect, useCallback } from "react"
import { useUIStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
  category: string
}

export const shortcuts: ShortcutConfig[] = [
  {
    key: "k",
    meta: true,
    action: () => {},
    description: "Open command palette",
    category: "Navigation"
  },
  {
    key: "n",
    meta: true,
    action: () => {},
    description: "Toggle notes panel",
    category: "Navigation"
  },
  {
    key: "/",
    action: () => {},
    description: "Open search",
    category: "Navigation"
  },
  {
    key: "z",
    meta: true,
    shift: true,
    action: () => {},
    description: "Toggle zen mode",
    category: "View"
  },
  {
    key: "j",
    action: () => {},
    description: "Next module",
    category: "Navigation"
  },
  {
    key: "k",
    action: () => {},
    description: "Previous module",
    category: "Navigation"
  },
  {
    key: "?",
    action: () => {},
    description: "Show keyboard shortcuts",
    category: "Help"
  },
  {
    key: "Escape",
    action: () => {},
    description: "Close dialogs",
    category: "General"
  }
]

export function useKeyboardShortcuts(
  moduleNavigation?: { next?: string; prev?: string }
) {
  const router = useRouter()
  const { 
    toggleNotes, 
    toggleCommandPalette, 
    toggleSearch,
    toggleSidebar,
    closeNotes,
    closeCommandPalette,
    closeSearch,
    isNotesOpen,
    isCommandPaletteOpen,
    isSearchOpen
  } = useUIStore()

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement
    const isInput = target.tagName === "INPUT" || 
                    target.tagName === "TEXTAREA" || 
                    target.isContentEditable

    // Always allow Escape
    if (event.key === "Escape") {
      if (isNotesOpen) closeNotes()
      if (isCommandPaletteOpen) closeCommandPalette()
      if (isSearchOpen) closeSearch()
      return
    }

    // Don't trigger shortcuts when typing in inputs
    if (isInput) return

    const isMeta = event.metaKey || event.ctrlKey
    const isShift = event.shiftKey

    // Cmd/Ctrl + K - Command palette
    if (isMeta && event.key === "k") {
      event.preventDefault()
      toggleCommandPalette()
      return
    }

    // Cmd/Ctrl + N - Notes
    if (isMeta && event.key === "n") {
      event.preventDefault()
      toggleNotes()
      return
    }

    // Cmd/Ctrl + Shift + Z - Zen mode
    if (isMeta && isShift && event.key === "z") {
      event.preventDefault()
      toggleSidebar()
      return
    }

    // / - Search (when not in input)
    if (event.key === "/" && !isMeta) {
      event.preventDefault()
      toggleSearch()
      return
    }

    // j - Next module
    if (event.key === "j" && moduleNavigation?.next) {
      event.preventDefault()
      router.push(`/modules/${moduleNavigation.next}`)
      return
    }

    // k - Previous module (only when not Cmd+K)
    if (event.key === "k" && !isMeta && moduleNavigation?.prev) {
      event.preventDefault()
      router.push(`/modules/${moduleNavigation.prev}`)
      return
    }

    // ? - Show shortcuts help
    if (event.key === "?" && isShift) {
      event.preventDefault()
      toggleCommandPalette()
      return
    }

    // g then h - Go home
    // g then m - Go to modules
    // These could be implemented with a key sequence tracker
  }, [
    router, 
    moduleNavigation, 
    toggleNotes, 
    toggleCommandPalette, 
    toggleSearch,
    toggleSidebar,
    closeNotes,
    closeCommandPalette,
    closeSearch,
    isNotesOpen,
    isCommandPaletteOpen,
    isSearchOpen
  ])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

// Hook to get shortcut display string
export function getShortcutDisplay(shortcut: ShortcutConfig): string {
  const parts: string[] = []
  if (shortcut.meta) parts.push("⌘")
  if (shortcut.ctrl) parts.push("Ctrl")
  if (shortcut.shift) parts.push("⇧")
  if (shortcut.alt) parts.push("⌥")
  parts.push(shortcut.key.toUpperCase())
  return parts.join("")
}
