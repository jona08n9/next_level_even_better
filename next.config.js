/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['media.rawg.io', 'zwcshwxjwoffkdrdvbtp.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        port: '',
        pathname: '/media/games/**',
      },
    ],
  },
};

module.exports = nextConfig;
