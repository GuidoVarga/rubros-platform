/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  experimental: {
    serverSourceMaps: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
