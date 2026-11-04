import { highlight } from "./syntax";

export interface PrepSection {
  /** Anchor id from the source document: s1 … s57. Also what a "§15" means,
      so an id is never reused or renumbered once it is authored. */
  id: string;
  /** Display number — the section's position, so dropping one leaves no gap. */
  n: number;
  /** Heading with the leading "12. " stripped. */
  title: string;
  topic: Topic;
  /** First sentence of the answer, as a card teaser. */
  teaser: string;
  /** The answer body, minus its own heading. Trusted, authored HTML. */
  html: string;
}

/* Topics, in the order the contents lists them. The document itself is ordered
   by when each question came up, not by subject, so the mapping below is the
   only place the subject of a question is recorded. */
export const TOPICS = [
  /* Not a subject like the rest: these six came as one graded mock round, and
     they stay together at the top of the contents rather than scattering into
     the subjects they happen to touch. */
  "Mock round",
  /* Also not a subject: the hands-on ones, where the answer is code you write in
     front of them rather than something you explain. */
  "Code tasks",
  "JavaScript",
  "Async & timers",
  "React",
  "Performance",
  "Browser & network",
  "Security",
  "Architecture & tooling",
] as const;
export type Topic = (typeof TOPICS)[number];

const BY_TOPIC: Record<Topic, number[]> = {
  "Mock round": [52, 53, 54, 56, 57],
  "Code tasks": [1, 2, 5, 16, 26, 28, 50, 51, 55],
  JavaScript: [7, 14, 15, 27, 39, 40, 41, 42, 43, 44, 46, 47, 48, 49],
  "Async & timers": [3, 13, 45],
  React: [18, 19, 25, 29, 30, 31, 32, 33, 36, 37, 38],
  Performance: [8, 22, 23, 24, 34, 35],
  "Browser & network": [9, 10, 11, 20],
  Security: [17],
  "Architecture & tooling": [6, 12, 21],
};

const topicOf = new Map(TOPICS.flatMap((topic) => BY_TOPIC[topic].map((n) => [n, topic] as const)));

const SECTION = /<h2 id="(s\d+)">([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2 id="s|$)/g;

function text(html: string) {
  return html
    .replace(/<\/(?:td|th|tr|li|p|div|h\d)>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&mdash;/g, "—")
    .replace(/&rarr;/g, "→")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Shortens a teaser to tooltip length, cutting at a sentence where it can. */
function brief(teaser: string) {
  const stop = teaser.search(/[.?!]\s/);
  const one = stop > 40 ? teaser.slice(0, stop + 1) : teaser;
  return one.length > 150 ? `${one.slice(0, 150).trimEnd()}…` : one;
}

function attr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* The answers cross-reference each other as "§26" in plain prose — a number that
   points at nothing on a page where nothing is numbered. Each one becomes the
   title of the section it means, carrying that section's teaser as a tooltip, so
   the reference informs the reader in place instead of sending them away.
   Second pass: a reference needs the title and teaser of a section that may not
   have been parsed yet when it is read. */
const XREF = /§(\d+)/g;

function linkXrefs(html: string, byNumber: Map<number, PrepSection>) {
  /* Teasers say "§18" too, and a § inside the tooltip is the same unreadable
     thing. Resolved up front — which also keeps XREF out of its own replace
     callback, where the shared lastIndex would derail the outer pass. */
  const tips = new Map(
    [...byNumber].map(([n, section]) => [
      n,
      attr(brief(section.teaser).replace(XREF, (ref, d) => byNumber.get(Number(d))?.title ?? ref)),
    ]),
  );

  return html.replace(XREF, (whole, digits) => {
    const target = byNumber.get(Number(digits));
    // A reference to something the document no longer contains stays plain text.
    if (!target) return whole;

    return `<span class="xref" tabindex="0" aria-describedby="prep-xref-tip" data-tip="${tips.get(
      target.n,
    )}">${attr(target.title)}</span>`;
  });
}

/* Parses the whole authored document. The caller reads the file — this module is
   imported by the client too, so it stays free of node:fs. */
export function parseSections(raw: string): PrepSection[] {
  const sections = [...raw.matchAll(SECTION)].map(([, id, heading, body], i) => {
    // The authored number: what BY_TOPIC lists and what a "§15" resolves to.
    const authored = Number(id.slice(1));
    /* First prose block with something to say: a few sections open on a lead-in
       as short as "Answer:", which makes a useless card. */
    const blocks = [...body.matchAll(/<(?:p|div)(?:\s[^>]*)?>([\s\S]*?)<\/(?:p|div)>/g)].map((m) =>
      text(m[1]),
    );
    const teaser = blocks.find((b) => b.length > 60) ?? text(body);

    return {
      id,
      n: i + 1,
      title: text(heading).replace(/^\d+\.\s*/, ""),
      topic: topicOf.get(authored) ?? "JavaScript",
      teaser: teaser.length > 190 ? `${teaser.slice(0, 190).trimEnd()}…` : teaser,
      html: highlight(body.trim()),
    };
  });

  const byNumber = new Map(sections.map((section) => [Number(section.id.slice(1)), section]));
  for (const section of sections) {
    section.html = linkXrefs(section.html, byNumber);
  }

  return sections;
}
