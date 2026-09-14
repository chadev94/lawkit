import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage 공개 버킷 (section-media 등)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // 로컬 Supabase 스택 (supabase start)
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
