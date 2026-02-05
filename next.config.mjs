/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/manager.bookpanlam/public/site_images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/manager.bookpanlam/public/uploads/services/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/manager.bookpanlam/public/uploads/sellers/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/manager.bookpanlam/public/uploads/employees/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/manager.bookpanlam/public/uploads/static/**",
      },

      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
