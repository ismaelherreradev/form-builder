/** @type {import('next').NextConfig} */
/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  ignoreDuringBuilds: true,
}

export default config
