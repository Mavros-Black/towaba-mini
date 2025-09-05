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
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Ensure proper build output
  output: 'standalone',
  // Enable compression
  compress: true,
  // Optimize bundle
  swcMinify: true,
}

module.exports = nextConfig
