import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ReactNode } from "react"

import { Providers } from "@/app/Providers"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "DevFlow | Developer Questions and Community",
    template: "%s | DevFlow"
  },
  description:
    "A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "DevFlow",
    title: "DevFlow | Developer Questions and Community",
    description: "Ask programming questions, share answers, and connect with developers around the world.",
    images: [{ url: "/images/logo.png", width: 512, height: 512, alt: "DevFlow" }]
  },
  twitter: {
    card: "summary",
    title: "DevFlow | Developer Questions and Community",
    description: "Ask programming questions, share answers, and connect with developers around the world.",
    images: ["/images/logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
  },
  icons: {
    icon: "/images/site-logo.svg"
  }
}

// No session read here: a request-time read at the top of the root layout would block the
// whole app. Client components get the session from SessionProvider; server components
// call auth() inside their own Suspense boundary.
const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <body className={`${inter.className} ${spaceGrotesk.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
