import { ArrowUpRight, Atom, Coffee, Laptop, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Hero } from "@/components";
import { SITE_NAME } from "@/lib/seo";
import styles from "./about.module.css";

const description =
  "Who writes System Design Bits: Felipe Rodrigues, a frontend developer in Florianópolis, Brazil, learning system design by writing it down.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    url: "/about",
    siteName: SITE_NAME,
    title: `About · ${SITE_NAME}`,
    description,
  },
};

/* The rail illustration: laptop, code, and a briefcase it dashes across to.
   Every fill is a token, so it inverts cleanly between light and dark. */
function AvailabilityArt() {
  return (
    <svg viewBox="0 0 168 136" fill="none" aria-hidden="true">
      <ellipse cx="74" cy="80" rx="58" ry="48" fill="var(--sd-accent-wash)" />

      {/* spark lines over the lid */}
      <g stroke="var(--sd-accent)" strokeWidth="3.4" strokeLinecap="round">
        <path d="M50 33 L45 24" />
        <path d="M67 28 L67 18" />
        <path d="M84 33 L89 24" />
      </g>

      {/* dashed hop from the laptop to the briefcase */}
      <path
        d="M104 70 C 116 73 122 66 120 56"
        stroke="var(--sd-accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="3 6"
        opacity="0.75"
      />

      {/* laptop */}
      <rect
        x="34"
        y="46"
        width="76"
        height="54"
        rx="6"
        fill="var(--sd-surface2)"
        stroke="var(--sd-text)"
        strokeWidth="4.5"
      />
      <path
        d="M22 106 h100 a4 4 0 0 1 -4 6 H26 a4 4 0 0 1 -4 -6 z"
        fill="var(--sd-text)"
      />

      {/* </> on the screen */}
      <g
        stroke="var(--sd-accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M60 64 L52 73 L60 82" />
        <path d="M78 60 L68 86" />
        <path d="M86 64 L94 73 L86 82" />
      </g>

      {/* briefcase badge */}
      <rect
        x="118"
        y="14"
        width="38"
        height="38"
        rx="10"
        fill="var(--sd-surface2)"
        stroke="var(--sd-border-strong)"
        strokeWidth="1.5"
      />
      <path
        d="M132 29 v-2.5 a2.5 2.5 0 0 1 2.5 -2.5 h5 a2.5 2.5 0 0 1 2.5 2.5 V29"
        stroke="var(--sd-text)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect x="125" y="29" width="24" height="15" rx="3" fill="var(--sd-text)" />
    </svg>
  );
}

/* lucide dropped its brand icons, so these two are inlined rather than pulling in
   a second icon package for two glyphs. */
function LinkedInMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.3-.5-1.5.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <Hero eyebrow="About" title="Who's behind this">
        System Design Bits is put together by one person, in the open, as a way of learning
        the material properly rather than skimming it. Here is who that is and where it came
        from.
      </Hero>

      <div className={styles.cols}>
        <section className={styles.col}>
          <h2>The person</h2>
          <p>
            I&apos;m Felipe Rodrigues, a frontend developer in Florianópolis, Santa Catarina,
            Brazil. More than six years in React, TypeScript and Next.js. That is the interface
            layer, which is where you end up feeling every decision the backend already made
            for you.
          </p>
          <p>
            I started writing this because I wanted to understand how the systems underneath
            my components actually work. Not the vocabulary, the reasoning: how the people
            making those calls decide to scale an app, connect its pieces, and serve a few
            million users without the whole thing drifting out of consistency.
          </p>
          <p>
            Those answers are already out there, and they are well organised. ByteByteGo,
            DesignGurus.io, roadmap.sh and index 0 all cover this ground, and index 0 is where
            much of the source material for these pages comes from. This is not an attempt to
            replace any of them. I needed my own way of working through the material and
            tracking what I had actually covered, so I documented each concept here in the
            order that made sense to me.
          </p>
          <p>
            It is built for me first, and for anyone else who feels like learning something
            new.
          </p>
        </section>

        <section className={styles.col}>
          <h2>The project</h2>
          <p>
            A free, self-study roadmap through system design fundamentals: scaling, databases,
            caching, APIs, and the trade-offs underneath every distributed system. No signup,
            no paywall, no email capture. That is not a launch promise, it is the whole
            design.
          </p>
          <p>
            Every concept is one self-contained page: the big idea, why the problem exists, an
            analogy, the mechanism, worked examples and diagrams, what real systems do, the
            common mistakes, and a quiz to check what actually stuck. No prior background
            assumed, and you can read them in any order.
          </p>
          <p>
            I am not writing these from expertise. I read, and then I document what I read,
            because writing it out is what makes it stick and what stops me fooling myself
            about how much I have actually taken in. The roadmap doubles as a record of my own
            progress, and putting it somewhere public is the part that keeps me committed to
            finishing it.
          </p>
        </section>
      </div>

      <section className={styles.status} aria-label="Availability">
        <div className={styles.rail}>
          <div className={styles.art}>
            <AvailabilityArt />
          </div>
        </div>

        <div className={styles.body}>
          <p className={styles.pill}>
            <span className={styles.dot} aria-hidden="true" />
            Open to work
          </p>

          <p className={styles.lede}>
            Looking for a team with room to keep growing, where the reasoning behind the
            architecture is worth arguing about. If that sounds like yours, I would be glad to
            talk.
          </p>

          <div className={styles.facts}>
            <span className={styles.fact}>
              <Laptop size={15} strokeWidth={1.8} aria-hidden="true" />
              Remote only
            </span>
            <span className={styles.fact}>
              <Atom size={15} strokeWidth={1.8} aria-hidden="true" />
              React · TypeScript · Next.js
            </span>
            <span className={styles.fact}>
              <MapPin size={15} strokeWidth={1.8} aria-hidden="true" />
              Florianópolis, BR · UTC&#8209;3
            </span>
          </div>

          <div className={styles.links}>
            <a
              className={styles.link}
              href="https://www.linkedin.com/in/felipe-rodrigues-2929351b8"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInMark />
              LinkedIn
              <ArrowUpRight size={13} className={styles.arrow} aria-hidden="true" />
            </a>
            <a className={styles.link} href="mailto:dev.rodriguesfelipp@gmail.com">
              <Mail size={15} strokeWidth={1.8} aria-hidden="true" />
              Email
              <ArrowUpRight size={13} className={styles.arrow} aria-hidden="true" />
            </a>
            <a
              className={styles.link}
              href="https://github.com/felipprodrigues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubMark />
              GitHub
              <ArrowUpRight size={13} className={styles.arrow} aria-hidden="true" />
            </a>
            <a
              className={styles.link}
              href="https://buymeacoffee.com/devrodrigus"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Coffee size={15} strokeWidth={1.8} aria-hidden="true" />
              Buy me a coffee
              <ArrowUpRight size={13} className={styles.arrow} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
