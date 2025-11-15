/** @type {import('next').NextConfig} */
const nextConfig = {
 images: { unoptimized: true },
  reactStrictMode: false,
  experimental: { cookieStore: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

export default nextConfig