import type { MetadataRoute } from "next"

import { Job, Question, Tag, User } from "@/server/db"
import { dbConnect } from "@/server/db/connect"
import { getSiteUrl } from "@/shared/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${baseUrl}/tags`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/jobs`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/community`, changeFrequency: "daily", priority: 0.6 }
  ]

  try {
    await dbConnect()
    const [questions, jobs, tags, users] = await Promise.all([
      Question.find({}).select("_id updatedAt createdAt").lean(),
      Job.find({}).select("_id updatedAt postedDate").lean(),
      Tag.find({}).select("_id updatedAt createdAt").lean(),
      User.find({}).select("_id updatedAt createdAt").lean()
    ])

    return [
      ...staticRoutes,
      ...questions.map((item) => ({ url: `${baseUrl}/questions/${item._id}`, lastModified: item.updatedAt ?? item.createdAt, changeFrequency: "daily" as const, priority: 0.8 })),
      ...jobs.map((item) => ({ url: `${baseUrl}/jobs/${item._id}`, lastModified: item.updatedAt ?? item.postedDate, changeFrequency: "daily" as const, priority: 0.7 })),
      ...tags.map((item) => ({ url: `${baseUrl}/tags/${item._id}`, lastModified: item.updatedAt ?? item.createdAt, changeFrequency: "daily" as const, priority: 0.6 })),
      ...users.map((item) => ({ url: `${baseUrl}/profile/${item._id}`, lastModified: item.updatedAt ?? item.createdAt, changeFrequency: "weekly" as const, priority: 0.4 }))
    ]
  } catch {
    return staticRoutes
  }
}
