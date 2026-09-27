const SkeletonPill = () => (
  <div className="flex-center gap-1.5">
    <div className="size-[18px] animate-pulse rounded-sm bg-light-800 dark:bg-dark-300" />
    <div className="background-light700_dark400 flex-center min-w-5 rounded-sm p-1">
      <div className="h-3.5 w-3 animate-pulse rounded-sm bg-light-800 dark:bg-dark-300" />
    </div>
  </div>
)

const VotesFallback = () => (
  <div className="flex-center gap-2.5">
    <SkeletonPill />
    <SkeletonPill />
  </div>
)

export default VotesFallback
