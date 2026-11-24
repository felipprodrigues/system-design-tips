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
