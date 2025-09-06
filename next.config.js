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
}

module.exports = nextConfig
