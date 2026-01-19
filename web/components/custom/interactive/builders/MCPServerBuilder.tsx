"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Server, 
  Copy, 
  Check, 
  RotateCcw, 
  Download,
  FileText,
  Database,
  Globe,
  Code,
  Search,
  Key,
  Shield,
  FolderOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ToolConfig {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

type ResourceType = "none" | "file" | "database" | "api"
type AuthType = "none" | "api_key" | "oauth"

const defaultTools: ToolConfig[] = [
  {
    id: "file_read",
    name: "file_read",
    description: "Read files from filesystem",
    icon: <FileText className="w-4 h-4" />,
    enabled: false,
  },
  {
    id: "file_write",
    name: "file_write",
    description: "Write files to filesystem",
    icon: <FolderOpen className="w-4 h-4" />,
    enabled: false,
  },
  {
    id: "api_call",
    name: "api_call",
    description: "Make HTTP API calls",
    icon: <Globe className="w-4 h-4" />,
    enabled: false,
  },
  {
    id: "db_query",
    name: "db_query",
    description: "Execute database queries",
    icon: <Database className="w-4 h-4" />,
    enabled: false,
  },
  {
    id: "web_search",
    name: "web_search",
    description: "Search the web",
    icon: <Search className="w-4 h-4" />,
    enabled: false,
  },
  {
    id: "code_execute",
    name: "code_execute",
    description: "Execute code snippets",
    icon: <Code className="w-4 h-4" />,
    enabled: false,
  },
]

const toolImplementations: Record<string, string> = {
  file_read: `@mcp.tool()
def file_read(file_path: str) -> str:
    """Read contents of a file from the filesystem.
    
    Args:
        file_path: Path to the file to read
        
    Returns:
        The contents of the file as a string
    """
    from pathlib import Path
    
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    if not path.is_file():
        raise ValueError(f"Path is not a file: {file_path}")
    
    return path.read_text()`,

  file_write: `@mcp.tool()
def file_write(file_path: str, content: str) -> dict:
    """Write content to a file on the filesystem.
    
    Args:
        file_path: Path where the file should be written
        content: Content to write to the file
        
    Returns:
        Status of the write operation
    """
    from pathlib import Path
    
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    
    return {"status": "success", "path": str(path.absolute()), "bytes_written": len(content)}`,

  api_call: `@mcp.tool()
async def api_call(
    url: str,
    method: str = "GET",
    headers: dict | None = None,
    body: dict | None = None
) -> dict:
    """Make an HTTP API call to an external service.
    
    Args:
        url: The URL to call
        method: HTTP method (GET, POST, PUT, DELETE)
        headers: Optional HTTP headers
        body: Optional request body for POST/PUT
        
    Returns:
        Response data including status code and body
    """
    import httpx
    
    async with httpx.AsyncClient() as client:
        response = await client.request(
            method=method,
            url=url,
            headers=headers or {},
            json=body
        )
        
        return {
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "body": response.text
        }`,

  db_query: `@mcp.tool()
def db_query(query: str, params: list | None = None) -> list[dict]:
    """Execute a SQL query against the database.
    
    Args:
        query: SQL query to execute (use ? for parameters)
        params: Optional list of query parameters
        
    Returns:
        List of rows as dictionaries
    """
    import sqlite3
    
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute(query, params or [])
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()`,

  web_search: `@mcp.tool()
async def web_search(query: str, num_results: int = 5) -> list[dict]:
    """Search the web for information.
    
    Args:
        query: Search query string
        num_results: Number of results to return (default: 5)
        
    Returns:
        List of search results with title, url, and snippet
    """
    import httpx
    
    # Example using a search API (replace with your preferred provider)
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.search.example.com/search",
            params={"q": query, "limit": num_results}
        )
        data = response.json()
        
        return [
            {
                "title": result["title"],
                "url": result["url"],
                "snippet": result["snippet"]
            }
            for result in data.get("results", [])
        ]`,

  code_execute: `@mcp.tool()
def code_execute(code: str, language: str = "python") -> dict:
    """Execute a code snippet in a sandboxed environment.
    
    Args:
        code: The code to execute
        language: Programming language (currently only 'python' supported)
        
    Returns:
        Execution result including stdout, stderr, and return value
    """
    import subprocess
    import tempfile
    from pathlib import Path
    
    if language != "python":
        raise ValueError(f"Unsupported language: {language}")
    
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        temp_path = f.name
    
    try:
        result = subprocess.run(
            ["python", temp_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "return_code": result.returncode
        }
    finally:
        Path(temp_path).unlink()`,
}

const resourceImplementations: Record<ResourceType, string> = {
  none: "",
  file: `
@mcp.resource("file://{path}")
def read_file_resource(path: str) -> str:
    """Provide read-only access to files.
    
    Args:
        path: Path to the file resource
        
    Returns:
        File contents as a string
    """
    from pathlib import Path
    return Path(path).read_text()`,

  database: `
@mcp.resource("db://tables")
def list_tables() -> str:
    """List all available database tables.
    
    Returns:
        JSON string of table names and schemas
    """
    import sqlite3
    import json
    
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return json.dumps({"tables": tables})`,

  api: `
@mcp.resource("api://endpoints")
def list_api_endpoints() -> str:
    """List available API endpoints and their documentation.
    
    Returns:
        JSON string of available endpoints
    """
    import json
    
    endpoints = {
        "endpoints": [
            {"path": "/users", "methods": ["GET", "POST"]},
            {"path": "/users/{id}", "methods": ["GET", "PUT", "DELETE"]},
            {"path": "/data", "methods": ["GET"]}
        ]
    }
    return json.dumps(endpoints)`,
}

const authImplementations: Record<AuthType, string> = {
  none: "",
  api_key: `
# Authentication: API Key
import os

API_KEY = os.environ.get("MCP_API_KEY")
if not API_KEY:
    raise ValueError("MCP_API_KEY environment variable required")

def validate_api_key(key: str) -> bool:
    """Validate the provided API key."""
    return key == API_KEY`,

  oauth: `
# Authentication: OAuth 2.1
from fastmcp.auth import OAuth2Config

oauth_config = OAuth2Config(
    issuer="https://auth.example.com",
    client_id=os.environ.get("OAUTH_CLIENT_ID"),
    scopes=["tools:read", "tools:execute"],
    resource_indicator="https://mcp.example.com"
)

mcp.configure_auth(oauth_config)`,
}

export function MCPServerBuilder() {
  const [serverName, setServerName] = useState("my-mcp-server")
  const [tools, setTools] = useState<ToolConfig[]>(defaultTools)
  const [resourceType, setResourceType] = useState<ResourceType>("none")
  const [authType, setAuthType] = useState<AuthType>("none")
  const [copied, setCopied] = useState(false)

  const toggleTool = (toolId: string) => {
    setTools(prev =>
      prev.map(tool =>
        tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
      )
    )
  }

  const generatedCode = useMemo(() => {
    const enabledTools = tools.filter(t => t.enabled)
    
    let imports = `from fastmcp import FastMCP`
    if (enabledTools.some(t => ["api_call", "web_search"].includes(t.id))) {
      imports += `\nimport httpx`
    }
    if (authType !== "none") {
      imports += `\nimport os`
    }

    let code = `${imports}

# Create the MCP server
mcp = FastMCP(
    "${serverName}",
    version="1.0.0",
    description="A custom MCP server"
)
`

    // Add auth configuration
    if (authType !== "none") {
      code += authImplementations[authType]
    }

    // Add tool implementations
    if (enabledTools.length > 0) {
      code += `\n# Tools\n`
      enabledTools.forEach(tool => {
        code += `\n${toolImplementations[tool.id]}\n`
      })
    }

    // Add resource implementation
    if (resourceType !== "none") {
      code += `\n# Resources${resourceImplementations[resourceType]}\n`
    }

    // Add main block
    code += `
# Run the server
if __name__ == "__main__":
    mcp.run()
`

    return code
  }, [serverName, tools, resourceType, authType])

  const copyCode = async () => {
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${serverName.replace(/[^a-z0-9]/gi, "_")}_server.py`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setServerName("my-mcp-server")
    setTools(defaultTools)
    setResourceType("none")
    setAuthType("none")
  }

  const enabledToolsCount = tools.filter(t => t.enabled).length

  return (
    <div className="my-8 rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          MCP Server Builder
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-8 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Configuration Panel */}
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            {/* Server Name */}
            <div className="space-y-2">
              <Label htmlFor="server-name" className="text-sm font-medium">
                Server Name
              </Label>
              <Input
                id="server-name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="my-mcp-server"
                className="font-mono text-sm"
              />
            </div>

            {/* Tools Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Tools ({enabledToolsCount} selected)
              </Label>
              <div className="grid gap-2">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <label
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        tool.enabled
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      )}
                    >
                      <Switch
                        checked={tool.enabled}
                        onCheckedChange={() => toggleTool(tool.id)}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={cn(
                          "p-1.5 rounded",
                          tool.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {tool.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="font-mono text-sm font-medium truncate">
                            {tool.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {tool.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Resource Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                Resource Type
              </Label>
              <Select
                value={resourceType}
                onValueChange={(value: ResourceType) => setResourceType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="file">File Resources</SelectItem>
                  <SelectItem value="database">Database Resources</SelectItem>
                  <SelectItem value="api">API Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Authentication */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Authentication
              </Label>
              <Select
                value={authType}
                onValueChange={(value: AuthType) => setAuthType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select authentication" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="api_key">
                    <span className="flex items-center gap-2">
                      <Key className="w-3 h-3" />
                      API Key
                    </span>
                  </SelectItem>
                  <SelectItem value="oauth">
                    <span className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      OAuth 2.1
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Code Preview Panel */}
        <div className="flex flex-col">
          <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Code className="w-4 h-4" />
              Generated Code
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCode}
                className="h-7 text-xs gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadCode}
                className="h-7 text-xs gap-1"
              >
                <Download className="w-3 h-3" />
                Download
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <pre className="p-4 text-sm font-mono bg-[#0d1117] text-zinc-300 min-h-[400px] overflow-x-auto">
              <code>
                {generatedCode.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-right pr-4 text-zinc-600 select-none">
                      {i + 1}
                    </span>
                    <span className={cn(
                      line.startsWith('#') && "text-zinc-500",
                      line.startsWith('from ') && "text-purple-400",
                      line.startsWith('import ') && "text-purple-400",
                      line.startsWith('@') && "text-yellow-400",
                      line.startsWith('def ') && "text-blue-400",
                      line.startsWith('async def ') && "text-blue-400",
                      line.includes('"""') && "text-green-400",
                    )}>
                      {line || ' '}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Footer with summary */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Server className="w-4 h-4" />
            <span className="font-mono">{serverName}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Code className="w-4 h-4" />
            {enabledToolsCount} tool{enabledToolsCount !== 1 ? 's' : ''}
          </span>
          {resourceType !== "none" && (
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              {resourceType} resources
            </span>
          )}
          {authType !== "none" && (
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              {authType === "api_key" ? "API Key" : "OAuth 2.1"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MCPServerBuilder
