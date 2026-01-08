import { getAllModules } from "@/lib/modules"
import { NotesDashboard } from "@/components/custom/NotesDashboard"
import { Separator } from "@/components/ui/separator"

export default async function NotesPage() {
  const allModules = await getAllModules()

  return (
    <main className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Notes</h1>
        <p className="text-muted-foreground">
            View and manage all your personal notes from across the course.
        </p>
      </div>
      <Separator className="my-6" />
      <NotesDashboard allModules={allModules} />
    </main>
  )
}
