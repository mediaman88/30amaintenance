/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Synced Instagram photos are downloaded into /public/gallery, so they are
    // served as local files. These remote patterns only matter if you switch
    // lib/gallery.ts to hotlink Instagram's CDN directly (not recommended --
    // Instagram CDN URLs are signed and expire after a few days).
    remotePatterns: [
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
};

export default nextConfig;
