/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Move from experimental.serverComponentsExternalPackages to top-level serverExternalPackages
  serverExternalPackages: ['sharp'],
  experimental: {
    // Remove serverComponentsExternalPackages from here
  },
}

export default nextConfig;