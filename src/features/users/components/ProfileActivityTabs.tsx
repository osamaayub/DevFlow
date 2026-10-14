import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui"

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
  <Tabs
    value={activityType}
    onValueChange={(value) => onSelect(value as ActivityType)}
    aria-label="Profile activity"
  >
    <TabsList>
      {ACTIVITY_TABS.map(({ type, label }) => (
        <TabsTrigger key={type} value={type}>
          {label}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
)

export default ProfileActivityTabs
