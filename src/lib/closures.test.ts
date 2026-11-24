/* Run: npm test
   The answer and the walkthrough are hand-written: run the snippet and check the
   board, the tile pool and the walkthrough all agree with what it really prints. */

import assert from "node:assert/strict";
import { EXERCISE as ex } from "../app/interview-qa/closures/exercise";

const printed: string[] = [];
new Function("console", ex.code.join("\n"))({
  log: (...args: unknown[]) => printed.push(args.join(" ")),
});

assert.deepEqual(printed, ex.answer, "the engine prints what the board marks");
assert.equal(ex.labels.length, ex.answer.length, "one lettered slot per console.log");
assert.ok(ex.tiles.length > ex.answer.length, "decoys in the pool");

const pool = [...ex.tiles];
for (const value of ex.answer) {
  const at = pool.indexOf(value);
  assert.ok(at !== -1, `a tile left for ${value}`);
  pool.splice(at, 1);
}

const last = ex.steps.at(-1);
assert.equal(last?.phase, "Done", "the walkthrough ends on Done");
assert.deepEqual(last?.out, ex.answer, "the walkthrough ends on the answer");

for (const [i, step] of ex.steps.entries()) {
  assert.deepEqual(step.out, ex.answer.slice(0, step.out.length), `step ${i}: console so far is the answer so far`);
  for (const line of step.lines) {
    assert.ok(line >= 0 && line < ex.code.length, `step ${i}: line ${line} exists`);
  }
}

console.log(`closures: ${ex.steps.length} steps, the snippet prints its answer`);
