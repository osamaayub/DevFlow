import type { Metadata } from "next"

type DynamicMetadataOptions = {
  title: string
  description: string
  url: string
  type?: "website" | "article" | "profile"
  keywords?: string[]
  category?: string
  tags?: string[]
  image?: string
  author?: string
  publishedTime?: string
}

export const createDynamicMetadata = ({
  title,
  description,
  url,
  type = "website",
  keywords = [],
  category,
  tags = [],
  image = "/images/logo.png",
  author,
  publishedTime,
}: DynamicMetadataOptions): Metadata => ({
  title,
  description,
  keywords,
  category,
  authors: author ? [{ name: author }] : undefined,
  alternates: { canonical: url },
  openGraph: {
    type,
    url,
    title,
    description,
    siteName: "DevFlow",
    images: [image],
    ...(author ? { authors: [author] } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(publishedTime ? { publishedTime } : {}),
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [image],
  },
})

export const createNotFoundMetadata = (title: string): Metadata => ({
  title,
  robots: { index: false, follow: false },
})
