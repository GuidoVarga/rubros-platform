/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  experimental: {
    serverSourceMaps: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
