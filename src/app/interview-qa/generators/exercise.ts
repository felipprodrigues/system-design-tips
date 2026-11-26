import type { Exercise, Scope } from "../closures/exercise";

const names: Scope = { name: "Variables", vars: [["idGen", "ƒ*"], ["g", "", "idGen frame"]] };
const frame = (state: string, vars: Scope["vars"], extra: Partial<Scope> = {}): Scope => ({
  name: "idGen frame",
  vars: [["state", state], ...vars],
  ...extra,
});
const out = ["started", "1", "2", "1", "stop", "true", "1,a,b,2"];

export const EXERCISE: Exercise = {
  hint: "Calling a generator runs none of its body. Each next() runs it to the next yield and pauses there with every local intact. The argument to next() becomes the value of the yield it resumes. return() ends it for good.",
  memory: "The generator's frame (a highlighted border means it is paused, not finished)",
  code: [
    "function* idGen() {",
    '  console.log("started");              // A',
    "  let id = 0;",
    "  while (true) {",
    "    const reset = yield ++id;",
    "    if (reset) id = 0;",
    "  }",
    "}",
    "",
    "const g = idGen();",
    "console.log(g.next().value);          // B",
    "console.log(g.next().value);          // C",
    "console.log(g.next(true).value);      // D",
    'console.log(g.return("stop").value);  // E',
    "console.log(g.next().done);           // F",
    "",
    'function* inner() { yield "a"; yield "b"; }',
    "function* outer() { yield 1; yield* inner(); yield 2; }",
    "console.log([...outer()].join());     // G",
  ],
  labels: ["A", "B", "C", "D", "E", "F", "G"],
  answer: out,
  tiles: ["started", "0", "1", "1", "2", "3", "stop", "undefined", "true", "false", "1,a,b,2", "1,2"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [9], scopes: [names, frame("not started", [], { fresh: true })], stack: [], out: [], phase: "Define", note: "Calling `idGen()` runs none of its body. It returns a generator object, `g`, holding a frame that has not started yet. Nothing prints." },
    { lines: [10, 1, 2, 4], scopes: [names, frame("paused at yield", [["id", "1"]], { kept: "paused, locals kept", changed: ["state", "id"] })], stack: ["g.next()"], out: out.slice(0, 2), phase: "Call", note: "The first `next()` runs the body from the top: `started` prints, then `++id` makes 1 and `yield` hands it out and pauses." },
    { lines: [11, 4, 5, 3, 4], scopes: [names, frame("paused at yield", [["id", "2"], ["reset", "undefined"]], { kept: "paused, locals kept", changed: ["id", "reset"] })], stack: ["g.next()"], out: out.slice(0, 3), phase: "Update", note: "`next()` with no argument resumes the paused `yield`, which evaluates to `undefined`. No reset, so the loop goes round and yields 2." },
    { lines: [12, 4, 5, 3, 4], scopes: [names, frame("paused at yield", [["id", "1"], ["reset", "true"]], { kept: "paused, locals kept", changed: ["id", "reset"] })], stack: ["g.next(true)"], out: out.slice(0, 4), phase: "Update", note: "`next(true)` sends `true` in: it becomes the value of the `yield`, so `reset` is `true`, `id` goes back to 0, and the next `++id` yields 1." },
    { lines: [13], scopes: [names, frame("closed", [], { changed: ["state"] })], stack: ["g.return()"], out: out.slice(0, 5), phase: "Return", note: '`return("stop")` ends the generator where it is paused and hands back `{ value: "stop", done: true }`. The loop never runs again.' },
    { lines: [14], scopes: [names, frame("closed", [])], stack: ["g.next()"], out: out.slice(0, 6), phase: "Read", note: "Every call after that gets `{ value: undefined, done: true }`." },
    { lines: [16, 17, 18], scopes: [{ name: "outer frame", vars: [["yields", "1, then 2"]], fresh: true }, { name: "inner frame", vars: [["yields", '"a", "b"']], fresh: true }], stack: ["outer()", "inner()"], out, phase: "Call", note: "Spread keeps calling `next()` until `done`. `yield*` hands control to `inner` until it is finished, so its values come out in the middle." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A started, B 1, C 2, D 1, E stop, F true, G 1,a,b,2." },
  ],
};

const pages = (state: string, extra: Partial<Scope> = {}): Scope => ({ name: "pages frame", vars: [["state", state]], ...extra });
const pageVars: Scope = { name: "Variables", vars: [["pages", "ƒ*"], ["it", "", "pages frame"]] };
const pulled = ["p1", "p2", "undefined", "x", "cleanup"];

export const EXTRA: Exercise = {
  hint: "Spread and for...of stop at done: true and drop the return value. A finished generator stays finished. Leaving a for...of early calls return(), which runs any finally block.",
  memory: "The generator's frame (a highlighted border means it is paused, not finished)",
  code: [
    "function* pages() {",
    '  yield "p1";',
    '  yield "p2";',
    '  return "end";',
    "}",
    "",
    "const it = pages();",
    "console.log(it.next().value);         // A",
    "console.log([...it].join());          // B",
    "console.log(it.next().value);         // C",
    "",
    "function* guarded() {",
    '  try { yield "x"; yield "y"; }',
    '  finally { console.log("cleanup"); } // E',
    "}",
    "for (const v of guarded()) {",
    "  console.log(v);                     // D",
    "  break;",
    "}",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: pulled,
  tiles: ["p1", "p2", "p2,end", "end", "undefined", "x", "y", "cleanup"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [6, 7, 1], scopes: [pageVars, pages("paused at yield", { fresh: true, kept: "paused" })], stack: ["it.next()"], out: pulled.slice(0, 1), phase: "Call", note: "The first `next()` runs to the first `yield` and hands out `p1`." },
    { lines: [8, 2, 3], scopes: [pageVars, pages("closed", { changed: ["state"] })], stack: ["spread"], out: pulled.slice(0, 2), phase: "Read", note: "Spread carries on from where `it` paused. It collects `p2`, then gets `{ value: \"end\", done: true }` and stops. The return value is not included." },
    { lines: [9], scopes: [pageVars, pages("closed")], stack: ["it.next()"], out: pulled.slice(0, 3), phase: "Read", note: "A finished generator stays finished. There is no rewinding: every call gives `{ value: undefined, done: true }`." },
    { lines: [15, 12, 16], scopes: [{ name: "Variables", vars: [["guarded", "ƒ*"]] }, { name: "guarded frame", vars: [["state", "paused inside try"]], kept: "paused", fresh: true }], stack: ["for...of"], out: pulled.slice(0, 4), phase: "Call", note: "The loop pulls `x`, and the generator pauses inside its `try`." },
    { lines: [17, 13], scopes: [{ name: "Variables", vars: [["guarded", "ƒ*"]] }, { name: "guarded frame", vars: [["state", "closed"]], changed: ["state"] }], stack: ["return()"], out: pulled, phase: "Return", note: "`break` makes the loop call `return()` on the generator. That finishes it from the paused `yield`, so the `finally` block still runs and `y` is never produced." },
    { lines: [], scopes: [], stack: [], out: pulled, phase: "Done", note: "Final answers: A p1, B p2, C undefined, D x, E cleanup." },
  ],
};
