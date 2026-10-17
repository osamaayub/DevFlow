import Link from "next/link"

import ROUTES from "@/shared/constants/route"
import { cn } from "@/shared/lib/utils"

export type MyJobsTab = "applied" | "saved" | "posted"

const TABS: Array<{ value: MyJobsTab; label: string }> = [
  { value: "applied", label: "Applied" },
  { value: "saved", label: "Saved" },
  { value: "posted", label: "Posted" },
]

const MyJobsTabs = ({ activeTab }: { activeTab: MyJobsTab }) => (
  <nav
    aria-label="My jobs"
    className="background-light800_dark300 light-border inline-flex w-full rounded-xl border p-1 sm:w-fit"
  >
    {TABS.map((tab) => {
      const isActive = tab.value === activeTab
      return (
        <Link
          key={tab.value}
          href={`${ROUTES.MY_JOBS}?tab=${tab.value}`}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "body-semibold flex-1 rounded-lg px-6 py-2.5 text-center transition-colors sm:flex-none",
            isActive
              ? "primary-gradient text-light-900"
              : "text-dark400_light700 hover:text-primary-500"
          )}
        >
          {tab.label}
        </Link>
      )
    })}
  </nav>
)

export default MyJobsTabs
