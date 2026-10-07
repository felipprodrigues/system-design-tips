import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Lesson URLs used to carry the authoring number (/lessons/07-request-lifecycle).
     Those links are already out in social posts that can't be edited, so every
     numbered path permanently redirects to the unnumbered one it became. One rule
     rather than an entry per lesson: the number is always a two-digit prefix, and
     what follows it is the slug the lesson kept. */
  async redirects() {
    return [
      {
        source: "/lessons/:number(\\d{2})-:slug([^/]+)",
        destination: "/lessons/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
