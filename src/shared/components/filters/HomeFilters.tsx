"use client";

import { homeFilters } from "@/shared/constants/filter"

import FilterButtons from "./FilterButtons"

const HomeFilters = () => {
  return (
    <FilterButtons
      filters={homeFilters}
      defaultValue="newest"
      otherClasses="mt-6"
    />
  )
}

export default HomeFilters