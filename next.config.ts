import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "frame-ancestors 'self'",
              "https://stock-buy-manager.vercel.app",
              "https://*.toss.im",
              "https://*.toss.co.kr",
              "http://localhost:*",
              "http://127.0.0.1:*",
            ].join(" "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
