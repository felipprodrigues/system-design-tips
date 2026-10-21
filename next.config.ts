import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Two generations of dead URLs point at every page, and both are already out in
     social posts that can't be edited, so both redirect permanently.

     NOTE: the sources below are the OLD paths and must keep saying "lessons" —
     they are the only place in the repo where that word is still correct. A
     find-and-replace that renames them turns the second rule into
     /concepts/:slug -> /concepts/:slug, an infinite redirect on every page.

     Pages used to live under /lessons, and before that the slug carried the
     authoring number (/lessons/07-request-lifecycle). The numbered rule has to
     come first: the catch-all below would otherwise send the numbered paths to
     /concepts/07-request-lifecycle, which doesn't exist. One rule each rather
     than an entry per page — the number is always a two-digit prefix, and the
     slug after it never changed. */
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
