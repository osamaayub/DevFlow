import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  /* config options here */
  output: "standalone",
  serverExternalPackages:["pino","pino-pretty"],
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
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        mongodb: false,
        mongoose: false,
      };
    }
    return config;
  }
};

export default nextConfig;
