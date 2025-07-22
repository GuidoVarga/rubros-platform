/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  trailingSlash: true,
  experimental: {
    serverSourceMaps: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self)', // ahora permite geolocalización desde tu propio dominio
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",

              "script-src 'self' 'unsafe-inline' 'unsafe-eval' pagead2.googlesyndication.com googleads.g.doubleclick.net www.googletagmanager.com ep1.adtrafficquality.google ep2.adtrafficquality.google",

              "style-src 'self' 'unsafe-inline' unpkg.com",

              "img-src 'self' data: blob: *.tile.openstreetmap.org unpkg.com cdn.jsdelivr.net tpc.googlesyndication.com pagead2.googlesyndication.com",

              "font-src 'self' fonts.gstatic.com",

              "connect-src 'self' unpkg.com tile.openstreetmap.org pagead2.googlesyndication.com googleads.g.doubleclick.net ep1.adtrafficquality.google",

              "frame-src pagead2.googlesyndication.com googleads.g.doubleclick.net",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          }
        ],
      },
    ];
  },
};

export default nextConfig;
