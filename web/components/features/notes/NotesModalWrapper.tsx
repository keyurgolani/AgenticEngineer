"use client"

import dynamic from "next/dynamic"

const NotesModal = dynamic(() => import("./NotesModal").then(mod => mod.NotesModal), {
  ssr: false,
})

export function NotesModalWrapper() {
  return <NotesModal />
}
