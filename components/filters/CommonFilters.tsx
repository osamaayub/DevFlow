"use client"

import { ListFilter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "../ui/select" 

interface Filter {
  name: string
  value: string
}

interface Props {
  filters: Filter[]
  paramKey?: string
  defaultValue?: string
  showFilterIcon?: boolean
  otherClasses?: string
  containerClasses?: string
}

const CommonFilter = ({
  filters,
  paramKey = "filter",
  defaultValue,
  showFilterIcon = false,
  otherClasses = "",
  containerClasses = "",
}: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const paramsFilter = searchParams.get(paramKey)

  const handleUpdateParams = (value: string) => {
    const newUrl =
      value === "all"
        ? removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: [paramKey],
          })
        : formUrlQuery({
            params: searchParams.toString(),
            key: paramKey,
            value,
          })

    router.push(newUrl, { scroll: false })
  }

  return (
    <div className={cn("relative", containerClasses)}>
      <Select
        onValueChange={handleUpdateParams}
        defaultValue={paramsFilter || defaultValue}
      >
        <SelectTrigger
          className={cn(
            "body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5 focus:ring-0 focus:ring-offset-0",
            otherClasses
          )}
          aria-label="Filter options"
        >
          {showFilterIcon && <ListFilter aria-hidden="true" className="size-4" />}
          <div className="line-clamp-1 flex-1 text-left">
            <SelectValue placeholder="Select a filter" />
          </div>
        </SelectTrigger>

        <SelectContent className="background-light900_dark200 text-dark500_light700">
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem 
                key={item.value} 
                value={item.value}
                className="cursor-pointer focus:bg-light-800 dark:focus:bg-dark-400"
              >
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default CommonFilter