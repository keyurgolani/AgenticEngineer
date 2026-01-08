"use client"

import * as React from "react"
import { Check, Copy, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePreferencesStore } from "@/lib/store"
import { API_PROVIDERS } from "@/constants/providers"

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false)
  const { injectKeys, apiKeys } = usePreferencesStore()

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false)
    }, 2000)
  }, [hasCopied])

  const processContent = React.useCallback((content: string) => {
    if (!injectKeys) return content
    
    let processed = content
    
    API_PROVIDERS.forEach(provider => {
        const key = apiKeys[provider.id]
        if (key) {
            // Replace standard Env Var patterns
            provider.envVars.forEach(envVar => {
                // Python: os.environ["VAR"]
                processed = processed.split(`os.environ["${envVar}"]`).join(`"${key}"`)
                processed = processed.split(`os.environ['${envVar}']`).join(`"${key}"`)
                processed = processed.split(`os.environ.get("${envVar}")`).join(`"${key}"`)
                processed = processed.split(`process.env.${envVar}`).join(`"${key}"`)
                // Generic YOUR_VAR_KEY placeholder
                processed = processed.split(`YOUR_${envVar}`).join(key)
            })
        }
    })
    
    return processed
  }, [injectKeys, apiKeys])

  const copyToClipboard = React.useCallback((value: string) => {
    const finalContent = processContent(value)
    navigator.clipboard.writeText(finalContent)
    setHasCopied(true)
  }, [processContent])

  const hasSmartContent = React.useMemo(() => {
     if (!injectKeys) return false
     
     return API_PROVIDERS.some(provider => {
         // If we have a key for this provider
         if (apiKeys[provider.id]) {
             // Check if content matches any of its patterns
             return provider.envVars.some(envVar => 
                 value.includes(envVar) || value.includes(`YOUR_${envVar}`)
             )
         }
         return false
     })
  }, [injectKeys, apiKeys, value])

  return (
    <Button
      size="icon"
      variant="outline"
      className={cn(
        "relative z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 [&_svg]:h-3 [&_svg]:w-3 bg-zinc-800 border-zinc-700",
        hasSmartContent && "border-blue-500/50 text-blue-200",
        className
      )}
      onClick={() => copyToClipboard(value)}
      title={hasSmartContent ? "Smart Copy (Keys Injected)" : "Copy to Clipboard"}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? (
        <Check /> 
      ) : hasSmartContent ? (
        <Wand2 className="w-3 h-3" />
      ) : (
        <Copy />
      )}
    </Button>
  )
}
