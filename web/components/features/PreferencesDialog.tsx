"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, X, Type, Eye, Zap, CheckCircle } from "lucide-react"
import { usePreferencesStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

interface PreferencesDialogProps {
  open: boolean
  onClose: () => void
}

export function PreferencesDialog({ open, onClose }: PreferencesDialogProps) {
  const {
    fontSize,
    setFontSize,
    reducedMotion,
    setReducedMotion,
    showReadingProgress,
    setShowReadingProgress,
    showEstimatedTime,
    setShowEstimatedTime,
    autoMarkComplete,
    setAutoMarkComplete
  } = usePreferencesStore()

  const mounted = useIsMounted()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  if (!mounted || !open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Preferences</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  Font Size
                </div>
                <div className="flex gap-2">
                  {(["small", "medium", "large"] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                        fontSize === size
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="space-y-4">
                <ToggleOption
                  icon={<Eye className="w-4 h-4" />}
                  label="Show Reading Progress"
                  description="Display progress bar while reading"
                  checked={showReadingProgress}
                  onChange={setShowReadingProgress}
                />
                
                <ToggleOption
                  icon={<Zap className="w-4 h-4" />}
                  label="Reduced Motion"
                  description="Minimize animations for accessibility"
                  checked={reducedMotion}
                  onChange={setReducedMotion}
                />
                
                <ToggleOption
                  icon={<Type className="w-4 h-4" />}
                  label="Show Estimated Time"
                  description="Display reading time estimates"
                  checked={showEstimatedTime}
                  onChange={setShowEstimatedTime}
                />
                
                <ToggleOption
                  icon={<CheckCircle className="w-4 h-4" />}
                  label="Auto-mark Complete"
                  description="Mark modules complete when scrolled to end"
                  checked={autoMarkComplete}
                  onChange={setAutoMarkComplete}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Preferences are saved automatically to your browser
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface ToggleOptionProps {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleOption({ icon, label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors text-left"
    >
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div
        className={cn(
          "w-10 h-6 rounded-full transition-colors relative",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? 20 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}

// Button to open preferences
export function PreferencesButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8"
        title="Preferences"
      >
        <Settings className="w-4 h-4" />
      </Button>
      <PreferencesDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
