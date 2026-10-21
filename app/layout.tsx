import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ReactNode } from "react"

import { Providers } from "@/app/Providers"
import { APP_METADATA } from "@/shared/constants/metadata"

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

export const metadata = APP_METADATA

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
