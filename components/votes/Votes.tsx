"use client"

import { Suspense } from "react"

import type { VoteParams } from "@/types"

import VoteContent from "./VoteContent"
import VotesFallback from "./VotesFallback"

const Votes = (props: VoteParams) => (
  <Suspense fallback={<VotesFallback />}>
    <VoteContent {...props} />
  </Suspense>
)

export default Votes
