/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ["ts", "tsx"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
