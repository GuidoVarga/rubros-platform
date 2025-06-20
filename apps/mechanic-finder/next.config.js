/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  experimental: {
    serverSourceMaps: true,
  },
  reactStrictMode: false,
  /*experimental: {
    serverComponentsExternalPackages: ['@rubros/ui']
  }*/
};

export default nextConfig;
