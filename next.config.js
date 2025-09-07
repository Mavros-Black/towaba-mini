/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress all build errors and warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Basic image configuration
  images: {
    domains: ['localhost', 'supabase.co', 'ckzlhntdecsdywiormow.supabase.co'],
  },
  // External packages
  serverExternalPackages: ['@prisma/client'],
  // Build timeout
  staticPageGenerationTimeout: 1000,
}

module.exports = nextConfig
