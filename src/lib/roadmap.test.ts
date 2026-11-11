/* Run: npm test
   No framework on purpose — the thing worth protecting is which concept the
   dashboard points at next, and that is pure array logic over two slug lists. */

import assert from "node:assert/strict";
import { bySlug, reading } from "./concepts";
import { pageMinutes, pages } from "./content";
import { deriveRoadmap } from "./roadmap";

const order = reading.map(({ concept }) => concept.slug);
const [first, second, third] = order;

{
  const r = deriveRoadmap([], []);
  assert.equal(r.done, 0);
  assert.equal(r.percent, 0);
  assert.equal(r.lastVisited, undefined, "nothing opened yet");
  assert.equal(r.next?.concept.slug, first, "a new reader starts at the top");
  assert.equal(r.remainingMinutes, r.totalMinutes);
}

{
  const r = deriveRoadmap([], [first]);
  assert.equal(r.lastVisited?.concept.slug, first);
  assert.equal(r.lastVisited?.status, "doing", "opened but not marked");
  assert.equal(r.next?.concept.slug, first, "in-progress beats unread");
}

{
  const r = deriveRoadmap([first], [first]);
  assert.equal(r.done, 1);
  assert.equal(r.lastVisited?.status, "done");
  assert.equal(r.next?.concept.slug, second, "finished, so move on");
  assert.equal(r.remainingMinutes, r.totalMinutes - r.sections[0].concepts[0].concept.minutes);
}

{
  /* A standalone page with no read time, or a slug a concept already owns, shows
     up as a wrong total rather than as an error. */
  const r = deriveRoadmap([], []);
  assert.equal(r.library.total, r.total + pages.length);
  assert.equal(r.library.done, 0);
  assert.ok(r.library.totalMinutes > r.totalMinutes, "the pages add reading time");
  assert.equal(r.library.remainingMinutes, r.library.totalMinutes, "nothing read yet");

  for (const page of pages) {
    assert.ok(!bySlug.has(page.slug), `"${page.slug}" collides with a concept slug`);
    assert.ok(pageMinutes(page.slug) > 0, `"${page.slug}" has no read time`);
  }

  const read = deriveRoadmap([pages[0].slug], [pages[0].slug]);
  assert.equal(read.library.done, 1, "a page marked read counts towards the library");
  assert.equal(read.done, 0, "but never towards the concept sequence");
  assert.ok(read.library.remainingMinutes < read.library.totalMinutes);
}

{
  /* Read times are joined on from the generated map, so a concept whose body is
     missing from it would silently read as "0 min" everywhere. */
  for (const { concept } of reading) {
    assert.ok(concept.minutes > 0, `${concept.slug} has no read time`);
  }
  assert.ok(deriveRoadmap([], []).totalMinutes > 100, "the library has a total read time");
}

{
  // Opened third, then second: the tail of the list is the most recent.
  const r = deriveRoadmap([], [third, second]);
  assert.equal(r.lastVisited?.concept.slug, second);
}

{
  // Reopening something already finished must not demote it to in-progress.
  const r = deriveRoadmap([first], [second, first]);
  assert.equal(r.lastVisited?.status, "done");
  assert.equal(r.next?.concept.slug, second, "the one left open wins over unread");
}

{
  const r = deriveRoadmap(order, order);
  assert.equal(r.percent, 100);
  assert.equal(r.next, undefined, "nothing left to point at");
  assert.equal(r.remainingMinutes, 0);
  assert.ok(r.sections.every((s) => s.done === s.total));
}

{
  // Junk slugs from a hand-edited localStorage must not inflate the count.
  const r = deriveRoadmap(["not-a-concept"], ["also-not-one"]);
  assert.equal(r.done, 0);
  assert.equal(r.lastVisited, undefined);
  assert.equal(r.next?.concept.slug, first);
}

{
  // Authored relations: a typo here is invisible in the UI, the rail just drops
  // the entry, so the wiring is checked rather than eyeballed.
  for (const { concept } of reading) {
    assert.ok(concept.related.length > 0, `${concept.slug} has no related concepts`);
    assert.ok(
      !concept.related.includes(concept.slug),
      `${concept.slug} lists itself as related`,
    );
    assert.equal(
      new Set(concept.related).size,
      concept.related.length,
      `${concept.slug} repeats a related slug`,
    );
    for (const slug of concept.related) {
      assert.ok(bySlug.has(slug), `${concept.slug} points at unknown slug "${slug}"`);
    }
  }
}

console.log("roadmap: all checks passed");
