/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: "standalone",
    basePath: process.env.BASE_PATH || "",
};

module.exports = nextConfig;
