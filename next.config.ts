import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.0.105'],
  images:{
    remotePatterns:[
      {
        protocol:'https',
        hostname:'utfs.io',
        port:'',
      }
    ]
  }
};

export default nextConfig;
