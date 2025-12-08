import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
      },
      // Production domains
      {
        protocol: 'https',
        hostname: 'api.naikkellas.com',
      },
      {
        protocol: 'https',
        hostname: 'naikkellas.com',
        port: '',
        pathname: "/api/uploads/**" 
      },
      // Third-party image sources
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co.com',
      }
    ],
  },
};

export default nextConfig;
