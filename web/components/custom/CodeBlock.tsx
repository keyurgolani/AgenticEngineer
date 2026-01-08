"use client"

import * as React from "react"
import { Terminal as TerminalIcon, WrapText, AlignLeft, ListOrdered, Pilcrow } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CopyButton } from "./CopyButton"

interface CodeBlockChild {
  type?: string
  props?: {
    children?: React.ReactNode
    className?: string
    'data-language'?: string
    [key: string]: unknown
  }
}

export const CodeBlock = ({ children, caption, raw, ...props }: { children: React.ReactNode; caption?: React.ReactElement<{ children?: React.ReactNode }>; raw?: string; [key: string]: unknown }) => {
  const [isWrapped, setIsWrapped] = React.useState(false)
  const [showLineNumbers, setShowLineNumbers] = React.useState(true)
  const [showWhitespace, setShowWhitespace] = React.useState(false)

  // Helper to find language from children
  const getLanguage = (): string => {
    const childArray = React.Children.toArray(children) as CodeBlockChild[]
    const langChild = childArray.find(child => child.props?.['data-language'])
    return langChild?.props?.['data-language'] || "Code"
  }

  return (
    <div className="relative my-6 rounded-lg overflow-hidden group bg-white dark:bg-[#282c34] !border-0 !ring-0 !shadow-none !outline-none border-transparent ring-transparent" {...props}>
      {/* Header Bar: Language + Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
           {/* If caption exists, show it. If not, show language or 'Code' */}
           {caption ? (
             <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
               <TerminalIcon className="w-3.5 h-3.5" />
               {caption.props.children}
             </span>
           ) : (
             <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
               {getLanguage()}
             </span>
           )}
        </div>

        <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setShowWhitespace(!showWhitespace)}
              title={showWhitespace ? "Hide Whitespace" : "Show Whitespace"}
            >
              <Pilcrow className={cn("h-3.5 w-3.5", showWhitespace && "text-primary")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              title={showLineNumbers ? "Hide Line Numbers" : "Show Line Numbers"}
            >
              <ListOrdered className={cn("h-3.5 w-3.5", showLineNumbers && "text-primary")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsWrapped(!isWrapped)}
              title={isWrapped ? "Disable Word Wrap" : "Enable Word Wrap"}
            >
              {isWrapped ? (
                <AlignLeft className="h-3.5 w-3.5" />
              ) : (
                <WrapText className="h-3.5 w-3.5" />
              )}
            </Button>
            <CopyButton 
              value={raw || ""} 
              className="relative text-muted-foreground hover:text-foreground border-0 h-6 w-6 bg-transparent hover:bg-transparent" 
            />
        </div>
      </div>

      <div className={cn(
        "overflow-x-auto p-4", 
        isWrapped && "whitespace-pre-wrap break-words",
        showLineNumbers && "show-line-numbers",
        showWhitespace && "show-whitespace"
      )}>
        {/* Pass isWrapped to pre if possible, or handle via CSS class in parent div */}
        {/* We need to ensure the pre tag inherits the whitespace setting. 
            The pre tag from rehype-pretty-code usually has overflow-x-auto.
            We will force style via the wrapper's class cascading down or cloneElement.
        */}
        {React.Children.map(children, (child) => {
           const typedChild = child as CodeBlockChild & React.ReactElement
           if (typedChild.type === 'pre' || typedChild.props?.['data-language']) {
               // Clone and add style/class if needed, but CSS inheritance is cleaner
               return React.cloneElement(typedChild, {
                   className: cn(typedChild.props?.className, isWrapped ? "whitespace-pre-wrap break-words" : "overflow-x-auto")
               })
           }
           if (child !== caption) return child;
           return null;
        })}
      </div>
    </div>
  )
}
