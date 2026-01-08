"use client"

import { useEffect } from "react"
import { usePreferencesStore } from "@/lib/store"

export function FontProvider() {
  const { fontSans, fontMono } = usePreferencesStore()

  useEffect(() => {
    const root = document.documentElement
    
    // Map internal names to CSS variables defined in layout.tsx
    const sansMap: Record<string, string> = {
      'inter': 'var(--font-inter)',
      'roboto': 'var(--font-roboto)',
      'manrope': 'var(--font-manrope)',
      'outfit': 'var(--font-outfit)',
    }
    
    const monoMap: Record<string, string> = {
      'jetbrains': 'var(--font-jetbrains)',
      'fira': 'var(--font-fira)',
      'ibm': 'var(--font-ibm)',
      'source': 'var(--font-source)',
    }

    const setFont = () => {
        const sansVar = sansMap[fontSans] || 'var(--font-inter)'
        const monoVar = monoMap[fontMono] || 'var(--font-jetbrains)'
        
        root.style.setProperty('--font-engine-sans', sansVar)
        root.style.setProperty('--font-engine-mono', monoVar)
        
        // Also set on body to ensure hierarchy
        document.body.style.setProperty('--font-engine-sans', sansVar)
        document.body.style.setProperty('--font-engine-mono', monoVar)
    }
    
    setFont()
  }, [fontSans, fontMono])

  return null
}
