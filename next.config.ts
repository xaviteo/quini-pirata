import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["node:sqlite"],
  async redirects() {
    return [{ source: "/mesa", destination: "/", permanent: false }];
  },
};

export default nextConfig;
