/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize package imports for better performance
  experimental: {
    optimizePackageImports: ['react-icons']
  },
  // Output standalone build for production
  output: 'standalone',
  // Optimize the build size
  compress: true,
  // Minimize during production builds
  swcMinify: true,
  // Disable unnecessary features
  reactStrictMode: true,
  poweredByHeader: false
}

module.exports = nextConfig 