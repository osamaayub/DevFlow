import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"

  return {
    rules: [{
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/api/",
        "/sign-in",
        "/sign-up",
        "/ask-question",
        "/collection",
        "/profile/edit",
        "/jobs/new",
        "/jobs/*/apply",
        "/jobs/*/edit",
        "/jobs/*/applicants",
        "/questions/*/edit",
        "/answers/*/edit"
      ]
    }],
    sitemap: `${baseUrl.replace(/\/$/, "")}/sitemap.xml`
  }
}
