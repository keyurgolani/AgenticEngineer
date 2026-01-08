"use client"

import { SearchDialog } from "./SearchDialog"

interface Module {
  slug: string
  title: string
  description: string
  week: number
  day: number
}

interface SearchWrapperProps {
  modules: Module[]
}

export function SearchWrapper({ modules }: SearchWrapperProps) {
  return <SearchDialog modules={modules} />
}
