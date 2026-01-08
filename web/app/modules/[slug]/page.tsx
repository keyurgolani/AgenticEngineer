import { getAllModules, getModulesByWeek, getModuleData } from "@/lib/modules"
import { MDXRenderer } from "@/components/custom/MDXRenderer"
import { notFound } from "next/navigation"
import { Breadcrumbs, CompletionButton, ModuleNavigation } from "@/components/custom/PageNavigation"
import { TableOfContents } from "@/components/custom/TableOfContents"
import { EditOnGithub } from "@/components/custom/EditOnGithub"
import { ReadingProgress } from "@/components/custom/ReadingProgress"
import { ModuleTracker } from "@/components/custom/ModuleTracker"
import { BookmarkButton } from "@/components/custom/BookmarkButton"
import { ScrollToTop } from "@/components/custom/ScrollToTop"
import { TimeTracker } from "@/components/custom/TimeTracker"
import { RelatedModules } from "@/components/custom/RelatedModules"

export async function generateStaticParams() {
  const modules = getAllModules()
  return modules.map((m) => ({
    slug: m.slug,
  }))
}

import { ModuleLayout } from "@/components/features/module/ModuleLayout"
import { ModuleSidebar } from "@/components/features/module/ModuleSidebar"

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const moduleData = getModuleData(slug)
  
  if (!moduleData) {
    notFound()
  }
  
  const { frontmatter, content } = moduleData
  const modules = getAllModules()
  const weeklyModules = getModulesByWeek()
  const weekNumbers = Object.keys(weeklyModules).map(Number).sort((a,b)=>a-b)
  
  const currentModule = modules.find(m => m.slug === slug)
  const currentIndex = modules.findIndex(m => m.slug === slug)
  const nextModule = modules[currentIndex + 1]
  const prevModule = modules[currentIndex - 1]
  
  const defaultWeek = currentModule?.week.toString() || "1"
  const safeTitle = (t?: string) => (t || "").split(": ")[1] || t || ""

  const SidebarContent = (
    <ModuleSidebar 
        defaultWeek={defaultWeek}
        weekNumbers={weekNumbers}
        weeklyModules={weeklyModules}
        currentSlug={slug}
    />
  )

  return (
    <ModuleLayout sidebarContent={SidebarContent}>
         {/* Reading Progress Bar */}
         <ReadingProgress />
         
         {/* Track module visit and time */}
         <ModuleTracker slug={slug} />
         <TimeTracker slug={slug} />
         
         {/* Breadcrumbs */}
         {currentModule && <Breadcrumbs module={currentModule} />}
         
         <div className="mb-8 border-b border-border pb-6">
             <div className="flex items-start justify-between gap-4">
               <div>
                 <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-2 text-foreground">{safeTitle(frontmatter.title)}</h1>
                 <p className="text-xl text-muted-foreground font-light">{frontmatter.description}</p>
               </div>
               <BookmarkButton slug={slug} />
             </div>
         </div>

         <div className="flex gap-12 relative flex-col-reverse lg:flex-row">
             <div className="flex-1 min-w-0">
                 <MDXRenderer source={content} />
                 
                 <CompletionButton slug={slug} />

                 <EditOnGithub slug={slug} />
                 
                 {/* Related Modules */}
                 {currentModule && (
                   <RelatedModules 
                     currentSlug={slug}
                     currentWeek={currentModule.week}
                     modules={modules}
                   />
                 )}

                 <ModuleNavigation 
                     prevModule={prevModule} 
                     nextModule={nextModule} 
                 />
             </div>
             
             {/* TOC Sidebar - Sticky */}
             <div className="hidden xl:block w-72 shrink-0">
                <div className="sticky top-24">
                     <TableOfContents />
                </div>
             </div>
         </div>
         
         {/* Scroll to top button */}
         <ScrollToTop />
    </ModuleLayout>
  )
}
