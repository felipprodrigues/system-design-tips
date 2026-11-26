import type { Exercise, Scope } from "../closures/exercise";

const arr = (n: number, extra: Partial<Scope> = {}): Scope => ({ name: `#${n} array`, vars: [["length", "0"]], ...extra });
const names = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars });
const abc: Scope["vars"] = [["a", "", "#1"], ["b", "", "#2"], ["c", "", "#1"]];
const out = ["false", "false", "true", "1", "0"];

export const EXERCISE: Exercise = {
  hint: "For objects and arrays, === asks whether both sides are the same object, not whether they look alike. Every [] is a new array.",
  memory: "Arrays in memory (two arrows into one box means one shared array)",
  code: [
    "const a = [];",
    "const b = [];",
    "const c = a;",
    "",
    "console.log([] === []); // A",
    "console.log(a === b);   // B",
    "console.log(a === c);   // C",
    "",
    'c.push("js");',
    "console.log(a.length); // D",
    "console.log(b.length); // E",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: out,
  tiles: ["false", "false", "true", "0", "1", "2"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1], scopes: [names(abc[0], abc[1]), arr(1, { fresh: true }), arr(2, { fresh: true })], stack: [], out: [], phase: "Allocate", note: "Two empty arrays, #1 and #2. `a` points to the first and `b` to the second." },
    { lines: [2], scopes: [{ ...names(...abc), changed: ["c"] }, arr(1), arr(2)], stack: [], out: [], phase: "Assign", note: "`c` gets a copy of the arrow in `a`, so it points to the same box, #1." },
    { lines: [4, 5, 6], scopes: [names(...abc), arr(1), arr(2), arr(3, { fresh: true }), arr(4, { fresh: true })], stack: [], out: out.slice(0, 3), phase: "Compare", note: "`[] === []` creates two fresh arrays, #3 and #4, so it is false. `a` and `b` point to different boxes, false. `a` and `c` point to the same box, true." },
    { lines: [8, 9, 10], scopes: [names(...abc), { name: "#1 array", vars: [["0", '"js"'], ["length", "1"]], changed: ["0", "length"] }, arr(2)], stack: [], out, phase: "Mutate", note: '`c.push("js")` adds an item to #1, the box shared by `a` and `c`. #2, the box for `b`, stays empty.' },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A false, B false, C true, D 1, E 0." },
  ],
};

const two = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars: [["a", "", "#1"], ["b", "", "#2"], ...vars] });
const item = (n: number): Scope => ({ name: `#${n} object`, vars: [["id", "1"]] });
const same = ["true", "true", "false", "true", "2"];

export const EXTRA: Exercise = {
  hint: "Primitives such as numbers and strings compare by value. Objects compare by identity, and so does every built-in that looks for an object: includes, indexOf, Set and Map.",
  memory: "Objects in memory (two arrows into one box means one shared object)",
  code: [
    "const a = { id: 1 };",
    "const b = { id: 1 };",
    "console.log(a.id === b.id);                           // A",
    "console.log(JSON.stringify(a) === JSON.stringify(b)); // B",
    "",
    "const list = [a];",
    "console.log(list.includes(b));                        // C",
    "console.log(list.includes(a));                        // D",
    "",
    "const set = new Set([[], []]);",
    "console.log(set.size);                                // E",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: same,
  tiles: ["true", "true", "true", "false", "false", "1", "2"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1], scopes: [two(), { ...item(1), fresh: true }, { ...item(2), fresh: true }], stack: [], out: [], phase: "Allocate", note: "Two literals, two objects: #1 and #2 look the same but are separate boxes." },
    { lines: [2, 3], scopes: [two(), item(1), item(2)], stack: [], out: same.slice(0, 2), phase: "Compare", note: "`a.id` and `b.id` are both the number 1, and numbers compare by value. `JSON.stringify` turns each object into a string, and two equal strings are `===` too." },
    { lines: [5, 6, 7], scopes: [two(["list", "", "#3"]), { name: "#3 array", vars: [["0", "", "#1"]], fresh: true }, item(1), item(2)], stack: [], out: same.slice(0, 4), phase: "Compare", note: "`includes` compares each element with `===`. The array holds an arrow to #1, so it finds `a` but not `b`, even though #2 has the same contents." },
    { lines: [9, 10], scopes: [{ name: "Variables", vars: [["set", "", "#4"]] }, { name: "#4 Set", vars: [["item 1", "", "#5"], ["item 2", "", "#6"]], fresh: true }, { name: "#5 array", vars: [["length", "0"]], fresh: true }, { name: "#6 array", vars: [["length", "0"]], fresh: true }], stack: [], out: same, phase: "Allocate", note: "A Set drops duplicates by identity too. The two `[]` are two different arrays, #5 and #6, so both stay: size 2." },
    { lines: [], scopes: [], stack: [], out: same, phase: "Done", note: "Final answers: A true, B true, C false, D true, E 2." },
  ],
};
