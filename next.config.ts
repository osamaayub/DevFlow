import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  // Prerender a static shell for every route and stream request-time parts behind Suspense
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.vecteezy.com"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com"
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc"
      }
    ]
  }
}

export default nextConfig
