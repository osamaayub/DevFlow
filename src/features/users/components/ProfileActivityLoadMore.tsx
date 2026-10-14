import { Button } from "@/shared/components/ui"

interface ProfileActivityLoadMoreProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => Promise<void>
}

const ProfileActivityLoadMore = ({
  hasMore,
  isLoading,
  onLoadMore,
}: ProfileActivityLoadMoreProps) => {
  if (!hasMore) {
    return null
  }

  return (
    <div className="mt-5 flex justify-center">
      <Button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="primary-gradient min-h-10 min-w-28 px-5 py-2 text-sm text-light-900"
      >
        {isLoading ? "Loading..." : "Load More"}
      </Button>
    </div>
  )
}

export default ProfileActivityLoadMore
