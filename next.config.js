/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Remove the outputFileTracing option from here
    serverComponentsExternalPackages: ['sharp'],
  },
  // If you still need file tracing, it may be a top-level option now
  // outputFileTracing: true,
}

module.exports = nextConfig