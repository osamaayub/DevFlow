"use client";

import FilterButtons from "./FilterButtons"

import { homeFilters } from "@/shared/constants/filter"


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