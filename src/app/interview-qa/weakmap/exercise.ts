import type { Exercise, Scope } from "../closures/exercise";

const row: Scope = { name: "#1 object", vars: [["id", "7"]] };
const meta: Scope = { name: "meta, WeakMap", vars: [["#1", '"42px"', "~#1"]], kept: "weak: does not keep #1 alive" };
const names = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars });
const out = ["42px", "false", "undefined", "undefined"];

export const EXERCISE: Exercise = {
  hint: "A WeakMap takes only objects as keys and holds them weakly: an entry is not a reason for its key to stay in memory. Because entries can vanish at any time, it cannot be counted or listed.",
  memory: "The WeakMap and its key in memory (solid arrows keep an object alive, dashed ones do not)",
  code: [
    "const meta = new WeakMap();",
    "let row = { id: 7 };",
    'meta.set(row, "42px");',
    "console.log(meta.get(row));          // A",
    "console.log(meta.has({ id: 7 }));    // B",
    "console.log(meta.size);              // C",
    "console.log(typeof meta.keys);       // D",
    "row = null;",
  ],
  labels: ["A", "B", "C", "D"],
  answer: out,
  tiles: ["42px", "7", "true", "false", "0", "1", "undefined", "undefined", "function"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2], scopes: [names(["row", "", "#1"]), { ...meta, changed: ["#1"], fresh: true }, { ...row, fresh: true }], stack: [], out: [], phase: "Add", note: "A WeakMap takes only objects as keys. The entry is stored against the object `row` points at, #1, with a dashed arrow: it does not count as holding #1." },
    { lines: [3], scopes: [names(["row", "", "#1"]), meta, row], stack: [], out: out.slice(0, 1), phase: "Read", note: "`get` with the same object finds the entry: `42px`." },
    { lines: [4], scopes: [names(["row", "", "#1"], ["has(…) arg", "", "#2"]), meta, row, { name: "#2 object", vars: [["id", "7"]], fresh: true }], stack: [], out: out.slice(0, 2), phase: "Read", note: "`{ id: 7 }` is a brand-new object, #2. The entry is keyed by #1, so `has` says `false`. Keys match by identity, as in a Map." },
    { lines: [5, 6], scopes: [names(["row", "", "#1"]), meta, row], stack: [], out, phase: "Read", note: "No `size` and no `keys()`. Entries can disappear whenever the engine collects a key, so there is nothing stable to count or list. Both read as `undefined`." },
    { lines: [7], scopes: [{ ...names(["row", "null"]), changed: ["row"] }, meta, { ...row, kept: "unreachable: free to collect" }], stack: [], out, phase: "Collect", note: "`row` no longer points at #1, and only the dashed arrow is left. Nothing can reach #1, so the engine may delete it, and the entry goes with it. With a Map here, that arrow would be solid and #1 would stay in memory for good." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A 42px, B false, C undefined, D undefined." },
  ],
};

const priv = (...entries: Scope["vars"]): Scope => ({ name: "priv, WeakMap", vars: entries, kept: "weak: does not keep a Counter alive" });
const counter = (n: number): Scope => ({ name: `#${n} Counter`, vars: [["(own keys)", "none"]] });
const hidden = ["1", "0", "true", "false", "TypeError"];

export const EXTRA: Exercise = {
  hint: "A WeakMap keyed by the instance is a way to give each object private data that nobody can list or reach without the map. delete and has work as in a Map. Keys must still be objects.",
  memory: "The WeakMap and the instances it is keyed by (dashed arrows do not keep an object alive)",
  code: [
    "const priv = new WeakMap();",
    "class Counter {",
    "  constructor() { priv.set(this, { n: 0 }); }",
    "  inc() { return ++priv.get(this).n; }",
    "}",
    "const c1 = new Counter();",
    "const c2 = new Counter();",
    "c1.inc(); c1.inc();",
    "console.log(c2.inc());                  // A",
    "console.log(Object.keys(c1).length);    // B",
    "console.log(priv.delete(c1));           // C",
    "console.log(priv.has(c1));              // D",
    'try { priv.set("id", 1); } catch (e) { console.log(e.name); } // E',
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: hidden,
  tiles: ["0", "1", "2", "3", "true", "false", "TypeError", "RangeError"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2, 3, 4, 5, 6], scopes: [names(["c1", "", "#1"], ["c2", "", "#2"]), { ...priv(["#1", "{ n: 0 }", "~#1"], ["#2", "{ n: 0 }", "~#2"]), fresh: true }, { ...counter(1), fresh: true }, { ...counter(2), fresh: true }], stack: [], out: [], phase: "Add", note: "Each constructor stores a `{ n: 0 }` in `priv`, keyed by the new instance. The instances themselves have no properties at all." },
    { lines: [7, 8], scopes: [names(["c1", "", "#1"], ["c2", "", "#2"]), { ...priv(["#1", "{ n: 2 }", "~#1"], ["#2", "{ n: 1 }", "~#2"]), changed: ["#1", "#2"] }, counter(1), counter(2)], stack: ["inc()"], out: hidden.slice(0, 1), phase: "Update", note: "Each instance finds its own entry through `this`. #1 was bumped twice, #2 once, so `c2.inc()` returns 1." },
    { lines: [9], scopes: [names(["c1", "", "#1"], ["c2", "", "#2"]), priv(["#1", "{ n: 2 }", "~#1"], ["#2", "{ n: 1 }", "~#2"]), counter(1), counter(2)], stack: [], out: hidden.slice(0, 2), phase: "Read", note: "The count lives in the map, not on #1, so `Object.keys` sees nothing. Without access to `priv`, the data is private." },
    { lines: [10, 11], scopes: [names(["c1", "", "#1"], ["c2", "", "#2"]), { ...priv(["#2", "{ n: 1 }", "~#2"]), changed: [] }, counter(1), counter(2)], stack: [], out: hidden.slice(0, 4), phase: "Collect", note: "`delete` removes #1's entry and returns `true`; after that `has` is `false`. Dropping `c1` would also remove it, on the engine's schedule." },
    { lines: [12], scopes: [names(["c1", "", "#1"], ["c2", "", "#2"]), priv(["#2", "{ n: 1 }", "~#2"]), counter(1), counter(2)], stack: [], out: hidden, phase: "Read", note: "A string cannot be held weakly, so using it as a key throws a `TypeError`." },
    { lines: [], scopes: [], stack: [], out: hidden, phase: "Done", note: "Final answers: A 1, B 0, C true, D false, E TypeError." },
  ],
};
