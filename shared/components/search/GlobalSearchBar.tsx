"use client"

import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Input } from "@/shared/components/ui/input"
import { formUrlQuery, removeKeysFromUrlQuery } from "@/shared/lib/url"

import { GlobalResult } from "./GlobalResult"

interface Props {
  placeholder?: string
  otherClasses?: string
}

export const GlobalSearchBar = ({
  placeholder = "Search for Questions Here...",
  otherClasses = "",
}: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlQuery = searchParams.get("global") || ""

  const [search, setSearch] = useState(urlQuery)
  const [isOpen, setIsOpen] = useState(Boolean(urlQuery))
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery)
  const [prevPathname, setPrevPathname] = useState(pathname)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Synchronize state during rendering when URL query or pathname changes externally
  // (eliminating redundant useEffect cycles and cascading re-renders)
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery)
    setSearch(urlQuery)
    if (urlQuery) {
      setIsOpen(true)
    }
  }

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsOpen(false)
  }

  // Manage outside click and escape key listeners only while the dropdown is open
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)

    if (!isOpen && val.trim().length > 0) setIsOpen(true)
    if (val === "" && isOpen) setIsOpen(false)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const trimmed = val.trim()
    if (trimmed === urlQuery) return

    debounceTimerRef.current = setTimeout(() => {
      if (trimmed) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "global",
          value: trimmed,
        })
        router.push(newUrl, { scroll: false })
      } else if (urlQuery) {
        const newUrl = removeKeysFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["global", "type"],
        })
        router.push(newUrl, { scroll: false })
      }
    }, 300)
  }

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setSearch("")
    setIsOpen(false)
    if (urlQuery) {
      const newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["global", "type"],
      })
      router.push(newUrl, { scroll: false })
    }
  }

  return (
    <div
      ref={searchContainerRef}
      className={`relative w-full max-w-[600px] max-lg:hidden ${otherClasses}`}
    >
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <Image
          src="/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
          className="cursor-pointer"
          onClick={() => {
            if (search.trim()) setIsOpen(true)
            inputRef.current?.focus()
          }}
        />

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={search}
          onFocus={() => {
            if (search.trim()) {
              setIsOpen(true)
            }
          }}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false)
              inputRef.current?.blur()
            }
          }}
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none bg-transparent shadow-none outline-none"
        />

        {search && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="flex items-center justify-center p-1"
          >
            <Image
              src="/icons/close.svg"
              alt="Clear search"
              width={16}
              height={16}
              className="cursor-pointer opacity-70 hover:opacity-100"
            />
          </button>
        )}
      </div>
      {isOpen && search.trim() && <GlobalResult onSelect={() => setIsOpen(false)} />}
    </div>
  )
}

export default GlobalSearchBar
