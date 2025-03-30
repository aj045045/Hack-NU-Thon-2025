import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/s/:path*',
        destination: process.env.FLASK_API || 'http://localhost:5000', // Rewrite to Flask API with default
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.microlink.io',
        pathname: '/**',
      },
    ]
  }
};

export default nextConfig;

