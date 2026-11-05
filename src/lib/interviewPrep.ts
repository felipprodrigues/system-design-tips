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

/* Contents order. The document is ordered by when each question came up, so
   BY_TOPIC below is the only record of what a question is about. */
export const TOPICS = [
  // Not subjects: one graded mock round, and the write-it-in-front-of-them ones.
  "Mock round",
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
  "Code tasks": [1, 2, 5, 16, 26, 28, 50, 51, 55, 58],
  JavaScript: [7, 14, 15, 27, 39, 40, 41, 42, 43, 44, 46, 47, 48, 49, 60],
  "Async & timers": [13, 45],
  React: [18, 19, 25, 29, 30, 31, 32, 33, 36, 37, 38, 62, 63, 64, 66, 67, 68],
  Performance: [8, 22, 23, 24, 34, 35, 65],
  "Browser & network": [9, 10, 11, 20],
  Security: [17],
  "Architecture & tooling": [6, 12, 21, 59, 61, 69],
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
