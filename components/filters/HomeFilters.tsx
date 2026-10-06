"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react"

import { homeFilters } from "@/constants/filter"
import { formUrlQuery } from "@/lib";
import { cn } from "@/lib/utils";

import { Button } from "../ui"

const HomeFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParams = searchParams.get("filter") || "newest";
  const searchParamsString = searchParams.toString();
  const [active, setActive] = useState(filterParams);

  useEffect(() => {
    setActive(filterParams);
  }, [filterParams]);

  const handleTypeClick = (filter: string) => {
    setActive(filter);
    const newUrl = formUrlQuery({
      params: searchParamsString,
      key: "filter",
      value: filter,
    });

    router.replace(newUrl, { scroll: false });
  }


  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {homeFilters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => handleTypeClick(filter.value)}
          className={cn(
            "body-medium rounded-lg px-5 py-2.5 capitalize shadow-none",
            active === filter.value
              ? "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400"
              : "bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500"
          )}
          aria-pressed={active === filter.value}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  )
}

export default HomeFilters