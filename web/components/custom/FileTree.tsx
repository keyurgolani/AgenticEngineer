"use client"

import React from "react"
import { Folder, FileCode, FileJson, FileType, File } from "lucide-react"

interface FileTreeProps {
  data: TreeData
  className?: string
}

type TreeItem = {
  name: string
  type: "file" | "folder"
  children?: TreeItem[]
}

type TreeData = TreeItem[]

// Helper to deduce icon
const getIcon = (name: string, type: "file" | "folder") => {
  if (type === "folder") return <Folder className="h-4 w-4 text-blue-400" />
  if (name.endsWith(".json")) return <FileJson className="h-4 w-4 text-yellow-400" />
  if (name.endsWith(".ts") || name.endsWith(".tsx") || name.endsWith(".js")) return <FileCode className="h-4 w-4 text-blue-400" />
  if (name.endsWith(".py")) return <FileCode className="h-4 w-4 text-yellow-300" />
  if (name.endsWith(".md") || name.endsWith(".mdx")) return <FileType className="h-4 w-4 text-gray-400" />
  return <File className="h-4 w-4 text-gray-400" />
}

export function FileTree({ data, className }: FileTreeProps) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 font-mono text-sm ${className}`}>
      <TreeList data={data} level={0} />
    </div>
  )
}

function TreeList({ data, level }: { data: TreeData; level: number }) {
  return (
    <ul className="space-y-1">
      {data.map((item, i) => (
        <li key={i} style={{ paddingLeft: level * 16 }}>
          <div className="flex items-center gap-2 py-0.5 text-muted-foreground hover:text-foreground transition-colors">
            {getIcon(item.name, item.type)}
            <span>{item.name}</span>
          </div>
          {item.children && <TreeList data={item.children} level={level + 1} />}
        </li>
      ))}
    </ul>
  )
}
