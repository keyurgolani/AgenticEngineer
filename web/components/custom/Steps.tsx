import React from "react"

export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-l border-border pl-8 my-8 relative">
      {React.Children.map(children, (child) => (
        <div className="relative">
          {child}
        </div>
      ))}
    </div>
  )
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 relative">
        <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border border-primary bg-background flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      <h3 className="text-lg font-bold mb-2 tracking-tight mt-0">{title}</h3>
      <div className="text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  )
}
