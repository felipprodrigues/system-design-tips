import { highlight } from "./syntax";

export interface PrepSection {
  /** Authored anchor, and what a "§15" resolves to. Never renumbered; has gaps. */
  id: string;
  /** Position in the document, unlike `id`. */
  n: number;
  title: string;
  topic: Topic;
  teaser: string;
  /** Trusted, authored HTML. */
  html: string;
}

/* Grouped by what the question is about — the library or the layer — not by the
   round it came up in. The document is ordered by when each question was asked,
   so BY_TOPIC is the only record of the subject. Coverage is checked by the test:
   a number claimed twice, or by nobody, fails it. */
export const TOPICS = [
  "JavaScript",
  "React",
  "Next.js & build",
  "Browser & CSS",
  // Not a subject: the write-it-in-front-of-them ones, and the graded rounds.
  "Code tasks",
  "Mock rounds",
] as const;
export type Topic = (typeof TOPICS)[number];

const BY_TOPIC: Record<Topic, number[]> = {
  JavaScript: [7, 13, 14, 15, 27, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 59, 60],
  React: [18, 19, 22, 24, 25, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 62, 63, 64, 65, 66, 67, 68],
  "Next.js & build": [12, 21, 23, 61, 69],
  "Browser & CSS": [8, 9, 10, 11, 17, 20, 52, 53],
  "Code tasks": [1, 2, 5, 16, 26, 28, 50, 51, 54, 55, 58],
  "Mock rounds": [6, 56, 57],
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

/* A bare "§26" means nothing to a reader, so each one becomes the target's
   title. Resolved in a second pass: the target may not be parsed yet. Both
   spellings occur in the hand-authored document. */
const XREF = /(?:§|&sect;)(\d+)/g;

function linkXrefs(html: string, byNumber: Map<number, PrepSection>) {
  // Built up front: XREF inside its own replace callback would share lastIndex.
  const tips = new Map(
    [...byNumber].map(([n, section]) => [
      n,
      attr(brief(section.teaser).replace(XREF, (ref, d) => byNumber.get(Number(d))?.title ?? ref)),
    ]),
  );

  return html.replace(XREF, (whole, digits) => {
    const target = byNumber.get(Number(digits));
    if (!target) return whole;

    // Authored number, not `target.n`: they diverge wherever an id is skipped.
    return `<span class="xref" tabindex="0" aria-describedby="prep-xref-tip" data-tip="${tips.get(
      Number(digits),
    )}">${attr(target.title)}</span>`;
  });
}

// The caller reads the file: the client imports this, so it stays free of node:fs.
export function parseSections(raw: string): PrepSection[] {
  const sections = [...raw.matchAll(SECTION)].map(([, id, heading, body], i) => {
    const authored = Number(id.slice(1));
    // Over 60 chars: some sections open on a lead-in as short as "Answer:".
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
  // Teasers render as text, so a reference is the bare title, not a span.
  for (const section of sections) {
    section.teaser = section.teaser.replace(
      XREF,
      (ref, digits) => byNumber.get(Number(digits))?.title ?? ref,
    );
  }
  for (const section of sections) {
    section.html = linkXrefs(section.html, byNumber);
  }

  return sections;
}
