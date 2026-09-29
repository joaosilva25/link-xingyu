import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2"],
  experimental: {
    serverActions: {
      // imagem de até 8 MB + overhead do multipart
      bodySizeLimit: "9mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/xingyu-consultoras/:path*",
        destination: "https://consultoras.xingyujewelry.com.br/:path*",
      },
    ];
  },
};

export default nextConfig;
