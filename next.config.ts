import type { NextConfig } from "next";

// chicken.or.kr SSL 인증서 체인 이슈 해결 (런타임 적용)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig: NextConfig = {};

export default nextConfig;
