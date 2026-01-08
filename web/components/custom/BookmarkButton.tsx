"use client"

import { useState, useSyncExternalStore } from "react"
import { motion } from "framer-motion"
import { Bookmark } from "lucide-react"
import { useProgressStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Hydration-safe mounting check
const emptySubscribe = () => () => {}
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

interface BookmarkButtonProps {
  slug: string
  variant?: "icon" | "full"
  className?: string
}

export function BookmarkButton({ slug, variant = "icon", className }: BookmarkButtonProps) {
  const { toggleBookmark, isBookmarked } = useProgressStore()
  const mounted = useIsMounted()
  const [isAnimating, setIsAnimating] = useState(false)

  if (!mounted) return null

  const bookmarked = isBookmarked(slug)

  const handleClick = () => {
    setIsAnimating(true)
    toggleBookmark(slug)
    setTimeout(() => setIsAnimating(false), 300)
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn(
          "h-8 w-8 transition-colors",
          bookmarked ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-foreground",
          className
        )}
        title={bookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Bookmark
            className={cn("w-4 h-4", bookmarked && "fill-current")}
          />
        </motion.div>
      </Button>
    )
  }

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      className={cn(
        "gap-2",
        bookmarked && "bg-amber-500 hover:bg-amber-600 text-white",
        className
      )}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
      </motion.div>
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  )
}
