"use client"

import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts"

interface KeyboardShortcutsProviderProps {
  moduleNavigation?: {
    next?: string
    prev?: string
  }
}

export function KeyboardShortcutsProvider({ moduleNavigation }: KeyboardShortcutsProviderProps) {
  useKeyboardShortcuts(moduleNavigation)
  return null
}

// Shortcut help dialog content
export function ShortcutsList() {
  const shortcuts = [
    { keys: ["⌘", "K"], description: "Open command palette" },
    { keys: ["⌘", "N"], description: "Toggle notes panel" },
    { keys: ["/"], description: "Open search" },
    { keys: ["⌘", "⇧", "Z"], description: "Toggle zen mode" },
    { keys: ["J"], description: "Next module" },
    { keys: ["K"], description: "Previous module" },
    { keys: ["?"], description: "Show shortcuts" },
    { keys: ["Esc"], description: "Close dialogs" },
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{shortcut.description}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, j) => (
                <kbd
                  key={j}
                  className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
