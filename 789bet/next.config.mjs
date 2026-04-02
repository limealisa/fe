/** @type {import('next').NextConfig} */

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Removed experimental features that may cause build issues on Vercel
  // experimental: {
  //   workerThreads: true,
  //   cpus: 4,
  //   parallelServerCompiles: true,
  //   parallelServerBuildTraces: true,
  //   webpackBuildWorker: true,
  // },

  reactStrictMode: false,
  trailingSlash: false,

  images: {
    loader: "custom",
    loaderFile: "./jsdevlivr.js",
    minimumCacheTTL: 43200,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "gwfd.qatgwawm.net",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.b728484.com",
        pathname: "**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://betapi.spaceplus.live/api/:path*",
      },
    ];
  },

  productionBrowserSourceMaps: false,

  webpack(config, { isServer }) {
    // Fix lỗi fs trên server
    if (isServer) {
      config.resolve.alias["fs"] = false;
    }

    return config;
  },
};

export default nextConfig;
