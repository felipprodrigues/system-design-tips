/* Run: npm test
   No framework on purpose — the thing worth protecting is which concept the
   dashboard points at next, and that is pure array logic over two slug lists. */

import assert from "node:assert/strict";
import { reading } from "./lessons";
import { deriveRoadmap } from "./roadmap";

const order = reading.map(({ lesson }) => lesson.slug);
const [first, second, third] = order;

{
  const r = deriveRoadmap([], []);
  assert.equal(r.done, 0);
  assert.equal(r.percent, 0);
  assert.equal(r.lastVisited, undefined, "nothing opened yet");
  assert.equal(r.next?.lesson.slug, first, "a new reader starts at the top");
  assert.equal(r.remainingMinutes, r.totalMinutes);
}

{
  const r = deriveRoadmap([], [first]);
  assert.equal(r.lastVisited?.lesson.slug, first);
  assert.equal(r.lastVisited?.status, "doing", "opened but not marked");
  assert.equal(r.next?.lesson.slug, first, "in-progress beats unread");
}

{
  const r = deriveRoadmap([first], [first]);
  assert.equal(r.done, 1);
  assert.equal(r.lastVisited?.status, "done");
  assert.equal(r.next?.lesson.slug, second, "finished, so move on");
  assert.equal(r.remainingMinutes, r.totalMinutes - r.sections[0].concepts[0].lesson.minutes);
}

{
  // Opened third, then second: the tail of the list is the most recent.
  const r = deriveRoadmap([], [third, second]);
  assert.equal(r.lastVisited?.lesson.slug, second);
}

{
  // Reopening something already finished must not demote it to in-progress.
  const r = deriveRoadmap([first], [second, first]);
  assert.equal(r.lastVisited?.status, "done");
  assert.equal(r.next?.lesson.slug, second, "the one left open wins over unread");
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
  assert.equal(r.next?.lesson.slug, first);
}

console.log("roadmap: all checks passed");
