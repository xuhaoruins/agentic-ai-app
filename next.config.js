/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable trace functionality which may be causing the permission issue
  experimental: {
    outputFileTracing: false,
  },
}

module.exports = nextConfig