import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"

export default function ModuleNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-3">Module Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The module you&apos;re looking for doesn&apos;t exist or may have been moved. 
        Check the URL or browse our available modules.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/modules/day-01-interface-of-agentic-ai">
            Start Learning
          </Link>
        </Button>
      </div>
    </div>
  )
}
