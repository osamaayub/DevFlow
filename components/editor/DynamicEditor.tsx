"use client"

import dynamic from "next/dynamic"

// MDXEditor relies on browser-only APIs and does not support SSR,
// so it must only ever be rendered on the client.
export const Editor = dynamic(() => import("./Editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <div className="background-light800_dark200 light-border-2 min-h-[450px] w-full animate-pulse border" />
  )
})
