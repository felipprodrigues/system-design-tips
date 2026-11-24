/* Run: npm test
   The answers and the walkthroughs are hand-written: run each snippet and check
   the board, the tile pool and the walkthrough all agree with what it really prints. */

import assert from "node:assert/strict";
import { EXERCISE as callApplyBind } from "../app/interview-qa/call-apply-bind/exercise";
import { EXERCISE as closures } from "../app/interview-qa/closures/exercise";
import { EXERCISE as collections } from "../app/interview-qa/set-map-weakmap-weakset/exercise";
import { EXERCISE as copy } from "../app/interview-qa/deep-vs-shallow-copy/exercise";

for (const [name, ex] of Object.entries({
  closures,
  copy,
  callApplyBind,
  collections,
})) {
  const printed: string[] = [];
  new Function("console", ex.code.join("\n"))({
    log: (...args: unknown[]) => printed.push(args.map(String).join(" ")),
  });

  assert.deepEqual(printed, ex.answer, `${name}: the engine prints what the board marks`);
  assert.equal(ex.labels.length, ex.answer.length, `${name}: one lettered slot per console.log`);
  assert.ok(ex.tiles.length > ex.answer.length, `${name}: decoys in the pool`);

  const pool = [...ex.tiles];
  for (const value of ex.answer) {
    const at = pool.indexOf(value);
    assert.ok(at !== -1, `${name}: a tile left for ${value}`);
    pool.splice(at, 1);
  }

  const last = ex.steps.at(-1);
  assert.equal(last?.phase, "Done", `${name}: the walkthrough ends on Done`);
  assert.deepEqual(last?.out, ex.answer, `${name}: the walkthrough ends on the answer`);

  for (const [i, step] of ex.steps.entries()) {
    assert.deepEqual(
      step.out,
      ex.answer.slice(0, step.out.length),
      `${name} step ${i}: console so far is the answer so far`,
    );
    for (const line of step.lines) {
      assert.ok(line >= 0 && line < ex.code.length, `${name} step ${i}: line ${line} exists`);
    }
    const names = step.scopes.map((scope) => scope.name);
    assert.equal(
      new Set(names).size,
      names.length,
      `${name} step ${i}: scope names are unique keys`,
    );
  }

  console.log(`${name}: ${ex.steps.length} steps, the snippet prints its answer`);
}
