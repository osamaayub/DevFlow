import dayjs from "dayjs"

export const formatJoinedAt = (date: Date | string) =>
  dayjs(date).format("MMMM YYYY")
