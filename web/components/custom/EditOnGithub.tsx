import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EditOnGithub({ slug }: { slug: string }) {
  // Assuming the structure is: web/content/modules/[slug].mdx
  const editUrl = `https://github.com/StartAgentic/agentic-engineer-handbook/edit/main/web/content/modules/${slug}.mdx`

  return (
    <div className="mt-8 pt-8 border-t border-border flex justify-end">
      <Button variant="link" size="sm" asChild className="text-muted-foreground hover:text-foreground">
        <Link href={editUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
           <Github className="w-4 h-4" />
           <span>Edit this page on GitHub</span>
        </Link>
      </Button>
    </div>
  )
}
