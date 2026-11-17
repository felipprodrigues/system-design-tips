/* Run: npm test
   The answers and the walkthrough steps are hand-written, so the one thing that
   can be wrong is the thing the page teaches. Each snippet is executed here with
   a captured console and checked against the answer the board marks, and against
   what the last walkthrough step claims printed. */

import assert from "node:assert/strict";
import { EXERCISES } from "../app/interview-qa/event-loop/exercises";

async function run(code: string[]) {
  const out: string[] = [];
  const log = (...args: unknown[]) => out.push(args.join(" "));
  new Function("console", code.join("\n"))({ log });
  // Long enough for a timer set inside a timer to have fired.
  await new Promise((resolve) => setTimeout(resolve, 50));
  return out;
}

assert.ok(EXERCISES.length >= 4, "at least four exercises to re-roll between");

for (const ex of EXERCISES) {
  const printed = await run(ex.code);
  assert.deepEqual(printed, ex.answer, `${ex.id}: the engine prints what the board marks`);

  const last = ex.steps.at(-1);
  assert.equal(last?.phase, "Done", `${ex.id}: the walkthrough ends on Done`);
  assert.deepEqual(last?.out, ex.answer, `${ex.id}: the walkthrough ends on the answer`);

  assert.equal(new Set(ex.answer).size, ex.answer.length, `${ex.id}: every tile is distinct`);

  let seen = 0;
  for (const [i, step] of ex.steps.entries()) {
    assert.ok(step.out.length >= seen, `${ex.id} step ${i}: the console never un-prints`);
    assert.deepEqual(
      step.out,
      ex.answer.slice(0, step.out.length),
      `${ex.id} step ${i}: the console so far is the answer so far`,
    );
    seen = step.out.length;

    for (const line of step.lines) {
      assert.ok(
        line >= 0 && line < ex.code.length,
        `${ex.id} step ${i}: line ${line} exists in the snippet`,
      );
    }
  }
}

console.log(`event loop: ${EXERCISES.length} exercises, every snippet prints its answer`);
