import type { Metadata } from "next"

import { getSiteUrl } from "@/shared/lib/seo"

export const APP_METADATA: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  generator: "Next.js",
  applicationName: "DevFlow",
  referrer: "origin-when-cross-origin",
  keywords: [
    "DevFlow",
    "developer community",
    "programming questions",
    "programming answers",
    "Q&A",
    "developers",
    "tech help",
    "JavaScript",
    "React",
    "Next.js",
    "TypeScript",
    "web development",
  ],
  authors: [
    { name: "Osama Ayub", url: "https://github.com/osamaayub" },
    { name: "DevFlow Team" },
  ],
  creator: "Osama Ayub",
  publisher: "DevFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  title: {
    default: "DevFlow | Developer Questions and Community",
    template: "%s | DevFlow",
  },
  description:
    "A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "DevFlow",
    title: "DevFlow | Ask & Answer Programming Questions",
    description:
      "Explore coding topics, ask questions, and get help from the DevFlow developer community.",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "DevFlow developer community",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "DevFlow | Ask & Answer Programming Questions",
    description:
      "Explore coding topics, ask questions, and get help from the DevFlow developer community.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/images/site-logo.svg",
    shortcut: "/images/site-logo.svg",
    apple: "/images/logo.png",
  },
}
