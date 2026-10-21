import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Two generations of dead URLs point at every page, and both are already out in
     social posts that can't be edited, so both redirect permanently.

     The lesson URLs used to carry the authoring number (/lessons/07-request-lifecycle),
     and the section was renamed from /lessons to /concepts on 2026-10-21. The numbered
     rule has to come first: the catch-all below would otherwise send the numbered paths
     to /concepts/07-request-lifecycle, which doesn't exist. One rule each rather than an
     entry per page — the number is always a two-digit prefix, and the slug after it never
     changed. */
  async redirects() {
    return [
      {
        source: "/lessons/:number(\\d{2})-:slug([^/]+)",
        destination: "/concepts/:slug",
        permanent: true,
      },
      {
        source: "/lessons/:slug",
        destination: "/concepts/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
