import type { NextConfig } from "next";

// chicken.or.kr SSL 인증서 체인 이슈 해결
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
