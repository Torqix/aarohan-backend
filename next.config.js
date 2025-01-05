/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.firebasestorage.googleapis.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "http": false,
      "https": false,
      "zlib": false,
      "path": false,
      "stream": false,
      "util": false,
      "crypto": false,
      "fs": false,
      "os": false,
      "net": false,
      "tls": false,
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@firebase/auth', 'firebase/auth'],
  },
};

module.exports = nextConfig; 