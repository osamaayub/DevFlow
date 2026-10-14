import type { ActivityType } from "./ProfileActivity.types"

const ACTIVITY_TABS: Array<{ type: ActivityType; label: string }> = [
  { type: "questions", label: "Top Posts" },
  { type: "answers", label: "Answers" },
]

interface ProfileActivityTabsProps {
  activityType: ActivityType
  onSelect: (activityType: ActivityType) => void
}

const ProfileActivityTabs = ({
  activityType,
  onSelect,
}: ProfileActivityTabsProps) => (
  <div
    aria-label="Profile activity"
    className="mb-5 flex w-full max-w-sm items-center gap-1 rounded-lg bg-light-800 p-1 dark:bg-dark-300"
  >
    {ACTIVITY_TABS.map(({ type, label }) => {
      const isActive = activityType === type

      return (
        <button
          key={type}
          type="button"
          aria-pressed={isActive}
          onClick={() => onSelect(type)}
          className={`min-h-10 flex-1 rounded-md px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 ${
            isActive
              ? "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300"
              : "bg-light-800 text-dark400_light700 dark:bg-dark-300"
          }`}
        >
          {label}
        </button>
      )
    })}
  </div>
)

export default ProfileActivityTabs
