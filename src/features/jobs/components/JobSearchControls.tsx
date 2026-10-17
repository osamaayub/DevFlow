"use client"

import { MapPin, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition, type FormEvent } from "react"

import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

interface JobSearchControlsProps {
  locations: string[]
}

const JobSearchControls = ({ locations }: JobSearchControlsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get("query") || ""
  const currentLocation = searchParams.get("location") || ""
  const [query, setQuery] = useState(currentQuery)
  const [location, setLocation] = useState(currentLocation)
  const [isPending, startTransition] = useTransition()
  const searchParamsString = searchParams.toString()

  useEffect(() => {
    setQuery(currentQuery)
    setLocation(currentLocation)
  }, [currentQuery, currentLocation])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params = new URLSearchParams(searchParamsString)
    params.delete("page")

    if (query.trim()) params.set("query", query.trim())
    else params.delete("query")

    if (location && location !== "all") params.set("location", location)
    else params.delete("location")

    const search = params.toString()
    startTransition(() => {
      router.push(search ? `/jobs?${search}` : "/jobs", { scroll: false })
    })
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mt-7 grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px] items-center gap-2 sm:gap-4"
    >
      <label className="background-light800_darkgradient light-border flex min-h-[56px] min-w-0 items-center gap-4 rounded-[10px] border px-4">
        <Search className="size-5 shrink-0 text-light-400" aria-hidden="true" />
        <span className="sr-only">Job title, company, or keywords</span>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Job Title, Company, or Keywords"
          className="paragraph-regular no-focus placeholder h-11 border-none bg-transparent px-0 text-dark400_light700 shadow-none outline-none"
        />
      </label>

      <Select value={location} onValueChange={setLocation}>
        <SelectTrigger className="background-light800_darkgradient light-border text-dark400_light500 min-h-[56px] w-full rounded-[10px] border px-4 shadow-none focus:ring-0 focus:ring-offset-0">
          <MapPin className="size-5 shrink-0 text-light-400" aria-hidden="true" />
          <SelectValue placeholder="Select Location" />
        </SelectTrigger>
        <SelectContent className="background-light900_dark200 text-dark500_light700">
          <SelectItem value="all">All locations</SelectItem>
          {location && location !== "all" && !locations.includes(location) && (
            <SelectItem value={location}>{location}</SelectItem>
          )}
          {locations.map((jobLocation) => (
            <SelectItem key={jobLocation} value={jobLocation}>
              {jobLocation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="submit"
        disabled={isPending}
        className="primary-gradient inline-flex h-14 w-full min-w-0 items-center justify-center gap-2 rounded-lg px-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70 sm:w-[120px] sm:px-4 sm:text-sm"
      >
        {isPending ? "Finding…" : "Find Jobs"}
      </button>
    </form>
  )
}

export default JobSearchControls
