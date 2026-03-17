import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ;
  font-src 'self' https:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: https:;
  connect-src 'self' https: wss:;
  frame-ancestors 'self' https://app.safe.global https://verify.walletconnect.org;
  object-src 'none';
  base-uri 'self';
  form-action 'self';  
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
    reactStrictMode: true,
    output: "standalone",
    basePath: process.env.BASE_PATH || "",
    async headers() {
        return [
            {
                source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: ContentSecurityPolicy.replace(
                            /\s{2,}/g,
                            " ",
                        ).trim(),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
