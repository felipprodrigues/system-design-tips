/* Run: npm test
   The topic mapping is hand-maintained numbers, so the one thing that rots is
   coverage: a question added to the document with no topic listed, or a number
   claimed by two topics. */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSections, TOPICS } from "./interviewPrep";

const sections = parseSections(
  readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
);

assert.ok(sections.length > 0, "the document parsed into sections");

{
  const numbers = sections.map((s) => s.n);
  assert.deepEqual(
    numbers,
    [...numbers].sort((a, b) => a - b),
    "sections stay in document order",
  );
  assert.equal(new Set(numbers).size, numbers.length, "no number appears twice");
}

{
  // Every topic a section claims is one the contents actually lists.
  for (const section of sections) {
    assert.ok(TOPICS.includes(section.topic), `${section.n} has an unknown topic`);
  }

  const counted = TOPICS.reduce(
    (total, topic) => total + sections.filter((s) => s.topic === topic).length,
    0,
  );
  assert.equal(counted, sections.length, "every section lands in exactly one topic");
}

{
  // A card with no teaser is a card with nothing but a title on it.
  for (const section of sections) {
    assert.ok(section.title.length > 3, `${section.n} lost its title`);
    assert.ok(section.teaser.length > 40, `${section.n} has no usable teaser`);
    assert.ok(section.html.length > 80, `${section.n} has no body`);
  }
}

{
  /* Every "§26" in the prose became the title of a section that exists, with a
     teaser to show on hover. This is what silently rots if sections are
     renumbered or a question is dropped. */
  const all = sections.map((s) => s.html).join("");
  const refs = [...all.matchAll(/<span class="xref"[^>]*data-tip="([^"]*)">([^<]*)<\/span>/g)];
  const titles = new Set(sections.map((s) => s.title));

  assert.ok(refs.length > 0, "the document cross-references itself");
  for (const [, tip, label] of refs) {
    assert.ok(titles.has(label), `a reference reads "${label}", which is no section's title`);
    assert.ok(tip.length > 20, `the reference to "${label}" carries no teaser`);
  }

  // A § left in plain text is a reference the rewrite failed to pick up.
  assert.equal(all.match(/§/g), null, "no § survived as plain text");
}

console.log(
  `interviewPrep: ${sections.length} sections, ${TOPICS.length} topics, ` +
    `${
      [
        ...sections
          .map((s) => s.html)
          .join("")
          .matchAll(/class="xref"/g),
      ].length
    } cross-references — ok`,
);

{
  /* Highlighting: every code block came back tokenised, and nothing lost or
     double-escaped its entities on the way through. */
  const all = sections.map((s) => s.html).join("");
  const blocks = [...all.matchAll(/<pre><code class="(\w+)">([\s\S]*?)<\/code><\/pre>/g)];

  assert.ok(blocks.length > 50, "the document still has its code blocks");
  for (const [, lang, code] of blocks) {
    if (lang === "plain") continue;
    assert.ok(code.includes('<span class="tok-'), `a ${lang} block came back untokenised`);
    assert.ok(!code.includes("&amp;lt;"), `a ${lang} block was escaped twice`);
  }

  const tokens = [...all.matchAll(/class="tok-(\w+)"/g)].map((m) => m[1]);
  for (const kind of ["comment", "string", "keyword", "number", "fn", "tag", "prop"]) {
    assert.ok(tokens.includes(kind), `nothing was highlighted as ${kind}`);
  }
}
