/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  experimental: {
    serverSourceMaps: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/*': ['node_modules/@rubros/db/dist/generated/prisma/**/*'],
  },
};

export default nextConfig;
