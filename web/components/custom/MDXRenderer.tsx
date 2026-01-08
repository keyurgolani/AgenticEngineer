import React from "react"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import { visit } from "unist-util-visit"
import { toString } from "hast-util-to-string"
// Imports cleaned up
import { Mermaid } from "./Mermaid"
import { Terminal } from "./Terminal"
import { Exercise } from "./Exercise"
import { Callout } from "./Callout"
// CopyButton removed
import { FileTree } from "./FileTree"
import { Steps, Step } from "./Steps"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ReadingTime, 
  Prerequisites, 
  Glossary, 
  LearningObjectives,
  SkillLevel,
  ConceptIntro,
  KeyTerms,
  ProgressCheckpoint,
  RealWorldExample,
  DifficultyRamp,
  CommonMistakes,
  ModuleSummary
} from "./QualityOfLife"

import { ConceptVisual } from "./ConceptVisual"
import { MemoryHierarchy } from "./animations/MemoryHierarchy"
import { ThinkingLoop } from "./animations/ThinkingLoop"
import { MLAnalogy } from "./MLAnalogy"
import { ProductionPattern } from "./ProductionPattern"
import { AutonomousLoop } from "./AutonomousLoop"
import { OrchestratorPattern } from "./OrchestratorPattern"

// New components from research
import { Quiz, MultiSelectQuiz } from "./Quiz"
import { CodeTabs, CodeDiff, InlineDiff } from "./CodeTabs"
import { CollapsibleCode, ExpandableSection, DeepDive } from "./CollapsibleCode"
import { ReActLoop, ToolTimeline, MultiAgentFlow } from "./animations/AgentFlow"
import { TokenCalculator, TokenCounter } from "./interactive/TokenCalculator"
import { FillInBlank, CodeCompletion } from "./FillInBlank"
import { ComparisonTable, SideBySide, ProsCons } from "./ComparisonTable"
import { AgentArchitecture, AgentComponentCard } from "./animations/AgentArchitecture"
import { PromptBuilder, PromptTemplate } from "./interactive/PromptBuilder"
import { CodePlayground } from "./interactive/CodePlayground"
import { PromptLibrary } from "./interactive/PromptLibrary"
import { KnowledgeBase } from "./interactive/KnowledgeBase"
import { TransformerArchitecture } from "./animations/TransformerArchitecture"
import { TokenFlowAnimation } from "./animations/TokenFlowAnimation"
import { StepAnimation } from "./animations/StepAnimation"

import { CodeBlock } from "./CodeBlock"

const components = {
  // ... existing components
  CodePlayground,
  PromptLibrary,
  KnowledgeBase,
  TransformerArchitecture,
  TokenFlowAnimation,
  StepAnimation,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 mt-2 scroll-m-20 text-foreground" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-3xl font-semibold tracking-tight first:mt-0 mt-12 mb-4 scroll-m-20 border-b border-border pb-2 text-foreground" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-2xl font-semibold tracking-tight mt-8 mb-4 scroll-m-20 text-foreground" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-muted-foreground" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground" {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  figure: (props: any) => { 
      // Check for raw code (passed from pre or hoisted to figure)
      const children = React.Children.toArray(props.children);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preElement = children.find((child: any) => child.type === 'pre' || child.props?.['data-raw']);
      
      // Raw might be on the figure itself (rehype-pretty-code behavior) or the child pre
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = props['data-raw'] || (preElement as any)?.props?.['data-raw'];
      
      // Check if this is a rehype-pretty-code figure
      const isCodeFigure = props['data-rehype-pretty-code-figure'] !== undefined || raw || preElement;

      // Check for title (figcaption)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const caption = children.find((child: any) => child.type === 'figcaption');

      if (isCodeFigure) {
          return (
             <CodeBlock caption={caption} raw={raw} {...props}>
                {children}
             </CodeBlock>
          )
      }
      return <figure className="my-6" {...props} />
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre {...props} className="overflow-x-auto" />,
  hr: () => <Separator className="my-12" />,
  // Tables
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
        <div className="max-w-full overflow-y-auto my-6 rounded-md border border-border">
          <table className="w-full text-left border-collapse" {...props} />
        </div>
      ),
      th: (props: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => <th className="border-b border-border bg-muted p-4 font-semibold text-foreground" {...props} />,
      td: (props: React.TdHTMLAttributes<HTMLTableDataCellElement>) => <td className="border-b border-border p-4 text-muted-foreground" {...props} />,
      // Custom Components
      Mermaid: (props: React.ComponentProps<typeof Mermaid>) => <Mermaid chart={props.chart} />,
      Terminal: (props: { command: string; output: string }) => <Terminal command={props.command} output={props.output} />,
      Exercise: (props: React.ComponentProps<typeof Exercise>) => <Exercise {...props} />,
      Callout: (props: React.ComponentProps<typeof Callout>) => <Callout {...props} />,
      FileTree: (props: React.ComponentProps<typeof FileTree>) => <FileTree {...props} />,
      Steps: (props: { children: React.ReactNode }) => <Steps {...props} />,
      Step: (props: { title: string; children: React.ReactNode }) => <Step {...props} />,
      Card: (props: React.HTMLAttributes<HTMLDivElement>) => <Card className="my-6" {...props} />,
      CardHeader: (props: React.HTMLAttributes<HTMLDivElement>) => <CardHeader {...props} />,
      CardTitle: (props: React.HTMLAttributes<HTMLHeadingElement>) => <CardTitle {...props} />,
      CardContent: (props: React.HTMLAttributes<HTMLDivElement>) => <CardContent {...props} />,
      Badge: (props: React.ComponentProps<typeof Badge>) => <Badge {...props} />,
      ReadingTime: (props: { minutes: number }) => <ReadingTime {...props} />,
      Prerequisites: (props: { items: string[] }) => <Prerequisites {...props} />,
      Glossary: (props: { term: string; def: string }) => <Glossary {...props} />,
      LearningObjectives: (props: { objectives: string[] }) => <LearningObjectives {...props} />,
      SkillLevel: (props: { level: "beginner" | "intermediate" | "advanced" | "expert"; description?: string }) => <SkillLevel {...props} />,
      ConceptIntro: (props: { title: string; analogy: string; technicalDef: string; whyItMatters?: string }) => <ConceptIntro {...props} />,
      KeyTerms: (props: { terms: { term: string; definition: string }[] }) => <KeyTerms {...props} />,
      ProgressCheckpoint: (props: { title?: string; questions: { question: string; answer: string }[] }) => <ProgressCheckpoint {...props} />,
      RealWorldExample: (props: { title: string; scenario: string; implementation: string; takeaway?: string }) => <RealWorldExample {...props} />,
      DifficultyRamp: (props: { current: number; total: number; label?: string }) => <DifficultyRamp {...props} />,
      CommonMistakes: (props: { mistakes: { mistake: string; fix: string }[] }) => <CommonMistakes {...props} />,
      ModuleSummary: (props: { points: string[] }) => <ModuleSummary {...props} />,
      ConceptVisual,
      ThinkingLoop: () => <ThinkingLoop />,
      MemoryHierarchy: () => <MemoryHierarchy />,
      MLAnalogy,
      ProductionPattern,
      AutonomousLoop,
      OrchestratorPattern,
      
      // New components from research
    
      Quiz,
      MultiSelectQuiz,
      CodeTabs,
      CodeDiff,
      InlineDiff,
      CollapsibleCode,
      ExpandableSection,
      DeepDive,
      ReActLoop,
      ToolTimeline,
      MultiAgentFlow,
      TokenCalculator,
      TokenCounter,
      FillInBlank,
      CodeCompletion,
      ComparisonTable,
      SideBySide,
      ProsCons,
      AgentArchitecture,
      AgentComponentCard,
      PromptBuilder,
      PromptTemplate,
    }
    
import { transformerRenderWhitespace } from "@shikijs/transformers"

    export function MDXRenderer({ source }: { source: string }) {
      const options = {
        theme: {
            dark: 'one-dark-pro',
            light: 'github-light',
        },
        keepBackground: false,
        showLineNumbers: true,
        transformers: [
            transformerRenderWhitespace(),
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onVisitLine(node: any) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty lines to be copy/pasted
            if (node.children.length === 0) {
                node.children = [{ type: 'text', value: ' ' }]
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onVisitHighlightedLine(node: any) {
            node.properties.className.push('line--highlighted')
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onVisitHighlightedWord(node: any) {
            node.properties.className = ['word--highlighted']
        },
      }
    
      // Custom plugin to inject raw code into the pre tag AND extract title
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rehypePreRaw = () => (tree: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        visit(tree, (node: any) => {
          if (node?.type === "element" && node?.tagName === "figure") {
             // Logic to help extract title from rehype-pretty-code output if needed
             // But usually rehype-pretty-code handles title -> data-rehype-pretty-code-title
          }
          
          if (node?.type === "element" && node?.tagName === "pre") {
            const [codeEl] = node.children
            if (codeEl.tagName !== "code") return
    
            const raw = toString(codeEl)
            node.properties["data-raw"] = raw
          }
        })
      }
      
     return (
        <article className="prose prose-zinc dark:prose-invert max-w-none prose-pre:bg-transparent prose-pre:p-0">
          <MDXRemote 
            source={source} 
            components={components} 
            options={{
                mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                        rehypeSlug,
                        // Pre-raw must run before pretty-code transforms it too much? 
                        // Actually usually after or we target the raw node. 
                        // Let's use standard pattern.
                        rehypePreRaw,
                        [rehypePrettyCode, options],
                    ]
                }
            }}
          />
        </article>
      )
    }
