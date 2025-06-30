/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  experimental: {
    serverSourceMaps: true,
  },
  reactStrictMode: false,
  experimental: {
    outputFileTracingIncludes: {
      '/*': ['node_modules/@rubros/db/dist/generated/prisma/**/*'],
    },
  },
};

export default nextConfig;
