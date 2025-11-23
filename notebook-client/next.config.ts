import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  experimental: {
    allowedDevOrigins: ["localhost:3000", "172.18.0.1:3000", "127.0.0.1:3000"],
  },
};

export default nextConfig;
