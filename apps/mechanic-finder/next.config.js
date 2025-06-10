/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  experimental: {
    serverSourceMaps: true,
  },
  /*experimental: {
    serverComponentsExternalPackages: ['@rubros/ui']
  }*/
};

export default nextConfig;
