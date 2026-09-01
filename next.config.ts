import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images:{
    remotePatterns:[
      {
        protocol:"https",
        hostname:"static.vecteezy.com"
      },
      {
        protocol:"https",
        hostname:"lh3.googleusercontent.com"
      },
      {
        protocol:"https",
        hostname:"avatars.githubusercontent.com"
      }
    ]
  }
};

export default nextConfig;