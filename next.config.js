/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Move from experimental.serverComponentsExternalPackages to top-level serverExternalPackages
  serverExternalPackages: ['sharp'],
  eslint: {
    // Disable ESLint during builds (optional)
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prevent webpack from getting stuck with large outputs
  webpack: (config) => {
    // Add optimization settings to help with build issues
    config.optimization.minimize = true;
    return config;
  },
  experimental: {
    // Remove serverComponentsExternalPackages from here
  },
}

export default nextConfig;