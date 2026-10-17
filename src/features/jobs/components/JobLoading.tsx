interface JobLoadingProps {
  variant: "list" | "details"
}

const JobLoading = ({ variant }: JobLoadingProps) => {
  if (variant === "details") {
    return (
      <div role="status" aria-label="Loading job details" className="mx-auto w-full max-w-5xl animate-pulse">
        <div className="mb-6 h-9 w-28 rounded bg-light-800 dark:bg-dark-300" />
        <div className="background-light900_dark200 light-border rounded-2xl border p-6 sm:p-8">
          <div className="flex gap-5">
            <div className="size-20 rounded-2xl bg-light-800 dark:bg-dark-300" />
            <div className="flex-1 space-y-3 py-2">
              <div className="h-4 w-32 rounded bg-light-800 dark:bg-dark-300" />
              <div className="h-7 w-3/4 rounded bg-light-800 dark:bg-dark-300" />
              <div className="h-4 w-1/2 rounded bg-light-800 dark:bg-dark-300" />
            </div>
          </div>
          <div className="mt-8 h-16 rounded bg-light-800 dark:bg-dark-300" />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="h-64 rounded-2xl bg-light-800 dark:bg-dark-300" />
          <div className="h-52 rounded-2xl bg-light-800 dark:bg-dark-300" />
        </div>
        <span className="sr-only">Loading job details</span>
      </div>
    )
  }

  return (
    <div role="status" aria-label="Loading jobs" className="animate-pulse">
      <div className="h-10 w-28 rounded bg-light-800 dark:bg-dark-300" />
      <div className="mb-8 mt-8 grid grid-cols-1 gap-3 sm:mb-12 sm:mt-10 sm:grid-cols-2 sm:gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_172px]">
        <div className="h-14 rounded-lg bg-light-800 dark:bg-dark-300" />
        <div className="h-14 rounded-lg bg-light-800 dark:bg-dark-300" />
        <div className="h-14 rounded-lg bg-light-800 dark:bg-dark-300 sm:col-span-2 md:col-span-1" />
      </div>
      <div className="flex flex-col gap-5 sm:gap-8">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="card-wrapper light-border h-44 rounded-[10px] border" />
        ))}
      </div>
      <span className="sr-only">Loading jobs</span>
    </div>
  )
}

export default JobLoading
