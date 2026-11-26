import type { Exercise, Scope } from "../closures/exercise";

const names: Scope = { name: "Variables", vars: [["wait", "ƒ"], ["fast", "ƒ 10ms"], ["slow", "ƒ 30ms"], ["boom", "ƒ 20ms, rejects"], ["main", "ƒ"]] };
const group = (name: string, vars: Scope["vars"], extra: Partial<Scope> = {}): Scope => ({ name, vars, ...extra });
const out = ["fast,slow", "boom", "fulfilled,rejected", "fast", "slow", "AggregateError"];

export const EXERCISE: Exercise = {
  hint: "Every promise starts the moment its function is called, so the combinator only decides when the group settles. all fails on the first rejection, allSettled never rejects, race takes the first to settle, any takes the first to fulfil.",
  memory: "Promises in flight (one box per combinator, with how each input ended up)",
  code: [
    "const wait = (ms, value, fail) =>",
    "  new Promise((resolve, reject) =>",
    "    setTimeout(() => (fail ? reject(value) : resolve(value)), ms));",
    'const fast = () => wait(10, "fast");',
    'const slow = () => wait(30, "slow");',
    'const boom = () => wait(20, "boom", true);',
    "",
    "async function main() {",
    "  const all = await Promise.all([fast(), slow()]);",
    "  console.log(all.join());                          // A",
    "",
    "  try { await Promise.all([fast(), boom(), slow()]); }",
    "  catch (err) { console.log(err); }                 // B",
    "",
    "  const settled = await Promise.allSettled([fast(), boom()]);",
    "  console.log(settled.map((r) => r.status).join()); // C",
    "",
    "  const first = await Promise.race([slow(), fast()]);",
    "  console.log(first);                               // D",
    "",
    "  const winner = await Promise.any([boom(), slow()]);",
    "  console.log(winner);                              // E",
    "",
    "  try { await Promise.any([boom(), boom()]); }",
    "  catch (err) { console.log(err.constructor.name); } // F",
    "}",
    "main();",
  ],
  labels: ["A", "B", "C", "D", "E", "F"],
  answer: out,
  tiles: ["fast,slow", "slow,fast", "boom", "fast", "fulfilled,rejected", "fulfilled,fulfilled", "fast", "slow", "slow", "AggregateError", "undefined"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2, 3, 4, 5, 7, 26], scopes: [{ ...names, fresh: true }], stack: ["main()"], out: [], phase: "Define", note: "`wait` returns a promise that settles after a timer. `fast`, `slow` and `boom` each start one when called. `main()` runs up to its first `await`." },
    { lines: [8], scopes: [names, group("Promise.all", [["fast()", "pending"], ["slow()", "pending"], ["result", "pending"]], { fresh: true })], stack: [], out: [], phase: "Call", note: "Both functions were called while the array was being built, so both timers are already running. `main` pauses at `await`." },
    { lines: [8, 9], scopes: [names, group("Promise.all", [["fast()", '"fast"'], ["slow()", '"slow"'], ["result", '["fast", "slow"]']], { changed: ["fast()", "slow()", "result"] })], stack: ["main()"], out: out.slice(0, 1), phase: "Settle", note: "fast fulfils at 10ms and slow at 30ms. `all` resolves when the last one does, with the values in input order, not finishing order." },
    { lines: [11], scopes: [names, group("Promise.all, fail fast", [["fast()", "pending"], ["boom()", "pending"], ["slow()", "pending"], ["result", "pending"]], { fresh: true })], stack: [], out: out.slice(0, 1), phase: "Call", note: "A second `all`, this time with `boom` in the middle. All three start at once again." },
    { lines: [11, 12], scopes: [names, group("Promise.all, fail fast", [["fast()", '"fast"'], ["boom()", 'rejected "boom"'], ["slow()", "still running"], ["result", 'rejected "boom"']], { changed: ["boom()", "result"] })], stack: ["main()"], out: out.slice(0, 2), phase: "Settle", note: "At 20ms `boom` rejects and `all` rejects with it straight away. `slow` is not cancelled: its timer still fires, nobody is listening. The `catch` logs `boom`." },
    { lines: [14, 15], scopes: [names, group("Promise.allSettled", [["fast()", "fulfilled"], ["boom()", "rejected"], ["result", "2 outcomes"]], { fresh: true })], stack: ["main()"], out: out.slice(0, 3), phase: "Settle", note: "`allSettled` waits for every input and never rejects. Each result is an object with a `status`, so the rejection is just data." },
    { lines: [17, 18], scopes: [names, group("Promise.race", [["slow()", "pending"], ["fast()", '"fast"'], ["result", '"fast"']], { fresh: true })], stack: ["main()"], out: out.slice(0, 4), phase: "Settle", note: "`race` settles with whichever input settles first. Position in the array does not matter: `fast` finishes at 10ms." },
    { lines: [20, 21], scopes: [names, group("Promise.any", [["boom()", "rejected"], ["slow()", '"slow"'], ["result", '"slow"']], { fresh: true })], stack: ["main()"], out: out.slice(0, 5), phase: "Settle", note: "`any` skips the rejection at 20ms and waits for the first fulfilment, `slow` at 30ms. A `race` here would have rejected with `boom`." },
    { lines: [23, 24], scopes: [names, group("Promise.any, all fail", [["boom() 1st", "rejected"], ["boom() 2nd", "rejected"], ["result", "AggregateError"]], { fresh: true })], stack: ["main()"], out, phase: "Settle", note: "`any` only rejects when every input has rejected, and then with an `AggregateError` that holds all the reasons in its `errors` array." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A fast,slow, B boom, C fulfilled,rejected, D fast, E slow, F AggregateError." },
  ],
};

const vars2: Scope = { name: "Variables", vars: [["wait", "ƒ"], ["timeout", "ƒ"], ["main", "ƒ"]] };
const edges = ["b,a,c", "0", "timeout", "no"];

export const EXTRA: Exercise = {
  hint: "all keeps input order whatever the finishing order, and treats a plain value as already fulfilled. An empty list resolves at once. race is how you build a timeout. allSettled hands a rejection back as data with a reason.",
  memory: "Promises in flight (one box per combinator, with how each input ended up)",
  code: [
    "const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));",
    'const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));',
    "",
    "async function main() {",
    '  const mixed = await Promise.all([wait(20, "b"), "a", wait(10, "c")]);',
    "  console.log(mixed.join());                   // A",
    "",
    "  const empty = await Promise.all([]);",
    "  console.log(empty.length);                   // B",
    "",
    '  try { await Promise.race([wait(50, "slow"), timeout(10)]); }',
    "  catch (err) { console.log(err.message); }    // C",
    "",
    '  const [r] = await Promise.allSettled([Promise.reject(new Error("no"))]);',
    "  console.log(r.reason.message);               // D",
    "}",
    "main();",
  ],
  labels: ["A", "B", "C", "D"],
  answer: edges,
  tiles: ["b,a,c", "a,c,b", "c,b,a", "0", "undefined", "timeout", "slow", "no", "Error"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 3, 16, 4], scopes: [{ ...vars2, fresh: true }, group("Promise.all", [["wait(20)", "pending"], ['"a"', "a plain value"], ["wait(10)", "pending"], ["result", "pending"]], { fresh: true })], stack: [], out: [], phase: "Call", note: "`main()` starts both timers while building the array. The string in the middle is not a promise, so `all` treats it as already fulfilled." },
    { lines: [4, 5], scopes: [vars2, group("Promise.all", [["wait(20)", '"b"'], ['"a"', '"a"'], ["wait(10)", '"c"'], ["result", '["b", "a", "c"]']], { changed: ["wait(20)", "wait(10)", "result"] })], stack: ["main()"], out: edges.slice(0, 1), phase: "Settle", note: "`c` finishes first, at 10ms, and `b` last, at 20ms. The result still follows input order: b, a, c." },
    { lines: [7, 8], scopes: [vars2, group("Promise.all, empty", [["result", "[]"]], { fresh: true })], stack: ["main()"], out: edges.slice(0, 2), phase: "Settle", note: "With nothing to wait for, `all` fulfils right away with an empty array." },
    { lines: [10, 11], scopes: [vars2, group("Promise.race", [["wait(50)", "still running"], ["timeout(10)", "rejected"], ["result", "rejected"]], { fresh: true })], stack: ["main()"], out: edges.slice(0, 3), phase: "Settle", note: "The timeout rejects at 10ms, long before the 50ms request, so the race rejects and the `catch` logs `timeout`. The slow promise is not cancelled; that needs an AbortController." },
    { lines: [13, 14], scopes: [vars2, group("Promise.allSettled", [["reject(...)", "rejected"], ["result", '[{ status: "rejected", reason }]']], { fresh: true })], stack: ["main()"], out: edges, phase: "Settle", note: "`allSettled` never rejects. The failure comes back as an object with `status` and `reason`, so nothing needs a `try`." },
    { lines: [], scopes: [], stack: [], out: edges, phase: "Done", note: "Final answers: A b,a,c, B 0, C timeout, D no." },
  ],
};
