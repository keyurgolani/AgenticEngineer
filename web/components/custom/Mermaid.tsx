"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface MermaidProps {
  chart: string;
  className?: string;
}

export function Mermaid({ chart, className }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !ref.current) return;

    const renderChart = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        
        // Determine theme based on resolvedTheme (which handles system pref)
        const currentTheme = resolvedTheme === 'dark' || resolvedTheme === 'black' ? 'dark' : 'base';
        
        // High contrast variables for better readability
        const themeVariables = currentTheme === 'dark' ? {
             primaryColor: '#3b82f6', // blue-500
             primaryTextColor: '#f8fafc', // slate-50
             primaryBorderColor: '#64748b', // slate-500
             lineColor: '#94a3b8', // slate-400
             secondaryColor: '#1e293b', // slate-800
             tertiaryColor: '#0f172a', // slate-900
        } : {
             primaryColor: '#2563eb', // blue-600
             primaryTextColor: '#0f172a', // slate-900
             primaryBorderColor: '#94a3b8', // slate-400
             lineColor: '#475569', // slate-600
             secondaryColor: '#f1f5f9', // slate-100
             tertiaryColor: '#ffffff', // white
        };

        mermaid.initialize({
          startOnLoad: false,
          theme: currentTheme,
          themeVariables: themeVariables,
          securityLevel: "loose",
          fontFamily: "var(--font-sans)",
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError(false);
      } catch (e) {
        console.error("Mermaid error:", e);
        setError(true);
      }
    };

    renderChart();
  }, [chart, isClient, resolvedTheme]);

  if (!isClient) {
    return (
      <div className={cn(
        "flex justify-center p-6 bg-secondary/30 rounded-lg my-6 overflow-x-auto min-h-[200px] items-center",
        className
      )}>
        <span className="text-muted-foreground text-sm">Loading diagram...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-500 rounded text-red-500 text-sm font-mono bg-red-500/10">
        Failed to render diagram.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex justify-center p-6 bg-secondary/30 rounded-lg my-6 overflow-x-auto",
        className
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
