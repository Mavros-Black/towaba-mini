/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Optimize for Vercel deployment
  serverExternalPackages: ['@prisma/client'],
  // Ensure proper build output
  output: 'standalone',
  // Enable compression
  compress: true,
  // Suppress ESLint warnings during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Time in seconds of no pages generating during static generation before timing out
  staticPageGenerationTimeout: 1000,
}

module.exports = nextConfig
