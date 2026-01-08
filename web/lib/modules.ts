import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { estimateReadingTime } from "./utils"

const modulesDirectory = path.join(process.cwd(), "content/modules")

export type Module = {
    slug: string
    title: string
    description: string
    week: number
    day: number
    readingTime?: number
}

export function getAllModules(): Module[] {
  const fileNames = fs.readdirSync(modulesDirectory)
  const modules = fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      const fullPath = path.join(modulesDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf8")
      const { data, content } = matter(fileContents)

      // Infer Day from filename "day-01-..."
      const dayMatch = fileName.match(/day-(\d+)/)
      const day = dayMatch ? parseInt(dayMatch[1]) : 999

      return {
        slug: fileName.replace(/\.mdx$/, ""),
        title: data.title,
        description: data.description,
        week: data.week || 1,
        day: day,
        readingTime: estimateReadingTime(content)
      }
    })
  
  return modules.sort((a, b) => a.day - b.day)
}

export function getModulesByWeek() {
    const modules = getAllModules()
    const byWeek: Record<number, Module[]> = {}
    
    modules.forEach(m => {
        if (!byWeek[m.week]) byWeek[m.week] = []
        byWeek[m.week].push(m)
    })
    
    return byWeek
}

export function moduleExists(slug: string): boolean {
  const fullPath = path.join(modulesDirectory, `${slug}.mdx`)
  return fs.existsSync(fullPath)
}

export function getModuleData(slug: string) {
  const fullPath = path.join(modulesDirectory, `${slug}.mdx`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }
  
  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  return {
    slug,
    frontmatter: data,
    content,
  }
}
