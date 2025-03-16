/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Move from experimental.serverComponentsExternalPackages to top-level serverExternalPackages
  serverExternalPackages: ['sharp'],
  eslint: {
    // Disable ESLint during builds (optional)
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Remove serverComponentsExternalPackages from here
  },
}

export default nextConfig;