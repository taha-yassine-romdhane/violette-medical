import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone so the Docker runner stage stays small.
  output: "standalone",

  // Admin uploads are written to public/uploads at runtime, which is a
  // bind mount in production. Next's image optimizer can serve them as-is.
  images: {
    remotePatterns: [],
  },

};

export default nextConfig;
