/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // Allow Strapi (local dev)
    // remotePatterns: [
    //   {
    //     protocol: 'http',
    //     hostname: '127.0.0.1',
    //     port: '1337',
    //     pathname: '/uploads/**',
    //   },
    //   {
    //     protocol: 'http',
    //     hostname: 'localhost',
    //     port: '1337',
    //     pathname: '/uploads/**',
    //   },
    //   // Allow your production Strapi / backend
    //   {
    //     protocol: 'https',
    //     hostname: 'api.dreamwayhl.com',
    //     pathname: '/uploads/**',
    //   },
    //   {
    //     protocol: 'https',
    //     hostname: 'blog.iconlifestyle.com.bd',
    //   },
    //   {
    //     protocol: 'https',
    //     hostname: 'images.unsplash.com',
    //   },
    //   // Allow example.com (for testing/sample data)
    //   {
    //     protocol: 'https',
    //     hostname: 'example.com',
    //   },
    //   // Allow ANY HTTPS domain (safe if images are trusted)
    //   {
    //     protocol: 'https',
    //     hostname: '**',
    //   },
    // ],
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '1337', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'blog.iconlifestyle.com.bd' },
      { protocol: 'https', hostname: 'api.dreamwayhl.com', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**' }, // <-- Allows ANY https image
    ],
  },
};

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/blog/:path*',
        destination: 'https://blog.iconlifestyle.com.bd/wp-json/wp/v2/:path*',
      },
    ];
  },
};

module.exports = nextConfig;