/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prisma: avoid bundling engine into the Next server graph (recommended for App Router).
  serverExternalPackages: ["@prisma/client"],
}

export default nextConfig
