/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  experimental: {
    serverSourceMaps: true,
  },
  reactStrictMode: false,
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['../../packages/db/generated/prisma/**/*'],
    },
  },
};

export default nextConfig;
