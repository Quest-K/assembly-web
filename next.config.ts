import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 빌드 시 타입 에러가 있어도 무시하고 강제 배포
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 문법 경고(eslint)가 있어도 무시하고 강제 배포
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;