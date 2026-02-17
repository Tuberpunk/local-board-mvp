/** @type {import('next').NextConfig} */
const nextConfig = {
  // Блок experimental удален, так как он больше не нужен
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
