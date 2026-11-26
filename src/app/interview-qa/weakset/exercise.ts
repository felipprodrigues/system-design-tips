import type { Exercise, Scope } from "../closures/exercise";

const row: Scope = { name: "#1 object", vars: [["id", "7"]] };
const seen: Scope = { name: "seen, WeakSet", vars: [["#1", "", "~#1"]], kept: "weak: does not keep #1 alive" };
const names = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars });
const out = ["true", "false", "undefined", "TypeError"];

export const EXERCISE: Exercise = {
  hint: "A WeakSet records only that it has seen an object: yes or no, no value attached. Members must be objects, are held weakly, and cannot be counted or listed.",
  memory: "The WeakSet and its member in memory (solid arrows keep an object alive, dashed ones do not)",
  code: [
    "const seen = new WeakSet();",
    "let row = { id: 7 };",
    "seen.add(row);",
    "console.log(seen.has(row));          // A",
    "console.log(seen.has({ id: 7 }));    // B",
    "console.log(seen.size);              // C",
    'try { seen.add("row"); } catch (e) { console.log(e.name); } // D',
    "row = null;",
  ],
  labels: ["A", "B", "C", "D"],
  answer: out,
  tiles: ["true", "true", "false", "false", "0", "1", "undefined", "TypeError", "RangeError"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2], scopes: [names(["row", "", "#1"]), { ...seen, changed: ["#1"], fresh: true }, { ...row, fresh: true }], stack: [], out: [], phase: "Add", note: "A WeakSet stores objects with no value attached: being in it is the whole record. The arrow is dashed, so membership does not count as holding #1." },
    { lines: [3], scopes: [names(["row", "", "#1"]), seen, row], stack: [], out: out.slice(0, 1), phase: "Read", note: "`has(row)` asks about #1 itself: `true`." },
    { lines: [4], scopes: [names(["row", "", "#1"], ["has(…) arg", "", "#2"]), seen, row, { name: "#2 object", vars: [["id", "7"]], fresh: true }], stack: [], out: out.slice(0, 2), phase: "Read", note: "`{ id: 7 }` is a brand-new object, #2. Only #1 is in the set, so the answer is `false`." },
    { lines: [5], scopes: [names(["row", "", "#1"]), seen, row], stack: [], out: out.slice(0, 3), phase: "Read", note: "No `size`. Members can disappear whenever the engine collects them, so there is nothing stable to count. It reads as `undefined`." },
    { lines: [6], scopes: [names(["row", "", "#1"]), seen, row], stack: ["seen.add()"], out, phase: "Add", note: "A string is not an object: nothing that could ever be collected, so there is nothing to hold weakly. `add` throws, and the catch prints `TypeError`." },
    { lines: [7], scopes: [{ ...names(["row", "null"]), changed: ["row"] }, seen, { ...row, kept: "unreachable: free to collect" }], stack: [], out, phase: "Collect", note: "`row` no longer points at #1, and only the dashed arrow is left. The engine may delete #1, and it drops out of the set by itself. A Set here would keep #1 alive for good." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A true, B false, C undefined, D TypeError." },
  ],
};

const nodeA = (next?: string): Scope => ({ name: "#1 object", vars: next ? [["name", '"a"'], ["next", "", next]] : [["name", '"a"']] });
const nodeB: Scope = { name: "#2 object", vars: [["next", "", "#1"]] };
const visited = (...members: string[]): Scope => ({ name: "seen, WeakSet", vars: members.map((m): Scope["vars"][number] => [m, "", `~${m}`]) });
const cycles = ["false", "true", "true", "false"];

export const EXTRA: Exercise = {
  hint: "Walking a structure, a WeakSet answers \"have I been here before?\" without keeping the visited objects alive after the walk. add returns the set itself, so calls chain.",
  memory: "The objects being walked and the visited set (dashed arrows do not keep an object alive)",
  code: [
    "function hasCycle(obj, seen = new WeakSet()) {",
    '  if (obj === null || typeof obj !== "object") return false;',
    "  if (seen.has(obj)) return true;",
    "  seen.add(obj);",
    "  return Object.values(obj).some((v) => hasCycle(v, seen));",
    "}",
    'const a = { name: "a" };',
    "const b = { next: a };",
    "console.log(hasCycle(b));               // A",
    "a.next = b;",
    "console.log(hasCycle(b));               // B",
    "",
    "const ws = new WeakSet();",
    "console.log(ws.add(a) === ws);          // C",
    "console.log(ws.has(b));                 // D",
  ],
  labels: ["A", "B", "C", "D"],
  answer: cycles,
  tiles: ["true", "true", "true", "false", "false", "undefined"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [6, 7], scopes: [names(["a", "", "#1"], ["b", "", "#2"]), { ...nodeA(), fresh: true }, { ...nodeB, fresh: true }], stack: [], out: [], phase: "Define", note: "#2 points at #1, and #1 points at nothing. No loop yet." },
    { lines: [8, 2, 3, 4], scopes: [names(["a", "", "#1"], ["b", "", "#2"]), nodeA(), nodeB, { ...visited("#2", "#1"), fresh: true }], stack: ["hasCycle(b)", "hasCycle(a)"], out: cycles.slice(0, 1), phase: "Read", note: "The walk marks #2, follows `next` to #1 and marks it, then finds only a string. Nothing was seen twice: `false`." },
    { lines: [9, 10, 2], scopes: [names(["a", "", "#1"], ["b", "", "#2"]), { ...nodeA("#2"), changed: ["next"] }, nodeB, { ...visited("#2", "#1"), fresh: true }], stack: ["hasCycle(b)", "hasCycle(a)", "hasCycle(b)"], out: cycles.slice(0, 2), phase: "Read", note: "Now #1 points back at #2. A new set marks #2 and then #1, then reaches #2 again, and `has` says it is already there: `true`." },
    { lines: [12, 13, 14], scopes: [names(["a", "", "#1"], ["b", "", "#2"], ["ws", "", "ws"]), nodeA("#2"), nodeB, { name: "ws, WeakSet", vars: [["#1", "", "~#1"]], fresh: true }], stack: [], out: cycles, phase: "Add", note: "`add` returns the WeakSet itself, which is why calls chain. Only #1 was added, so `has(b)` is `false`." },
    { lines: [], scopes: [], stack: [], out: cycles, phase: "Done", note: "Final answers: A false, B true, C true, D false." },
  ],
};
