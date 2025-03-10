/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  output: 'standalone',
  productionBrowserSourceMaps: false,
  swcMinify: true,
  cleanDistDir: true,
  webpack: (config) => {
    // Optimize webpack configuration for Azure Functions
    config.optimization.minimize = true;
    return config;
  },
};

module.exports = nextConfig;