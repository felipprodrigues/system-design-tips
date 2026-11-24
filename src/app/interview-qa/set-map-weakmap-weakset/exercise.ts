import type { Exercise, Scope } from "../closures/exercise";

const tags: Scope = { name: "tags, Set", vars: [["js", ""], ["css", ""], ["html", ""]] };
const home: Scope = { name: "#1 object", vars: [["path", '"/"']] };
const copy: Scope = { name: "#2 object", vars: [["path", '"/"']] };
const visits: Scope = { name: "visits, Map", vars: [["#1", "1", "#1"], ["#2", "2", "#2"]] };
const row: Scope = { name: "#4 object", vars: [["id", "7"]] };
const meta: Scope = { name: "meta, WeakMap", vars: [["#4", '"42px"', "~#4"]], kept: "weak: does not keep #4 alive" };
const seen: Scope = { name: "seen, WeakSet", vars: [["#4", "", "~#4"]], kept: "weak: does not keep #4 alive" };
const names = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars });
const out = ["3", "js,css,html", "2", "undefined", "1", "42px", "undefined", "false"];

export const EXERCISE: Exercise = {
  hint: "A Set keeps each value once. Map and Set compare object keys by reference, never by shape, so two identical-looking literals are two different keys. WeakMap and WeakSet take only objects, hold them weakly, and cannot be counted or iterated.",
  memory: "Collections and objects in memory (solid arrows keep an object alive, dashed ones do not)",
  code: [
    'const tags = new Set(["js", "css", "js"]);',
    'tags.add("css").add("html");',
    "console.log(tags.size);                   // A",
    "console.log([...tags].join());            // B",
    "",
    "const visits = new Map();",
    'const home = { path: "/" };',
    "visits.set(home, 1);",
    'visits.set({ path: "/" }, 2);',
    "console.log(visits.size);                 // C",
    'console.log(visits.get({ path: "/" }));   // D',
    "console.log(visits.get(home));            // E",
    "",
    "const meta = new WeakMap();",
    "let row = { id: 7 };",
    'meta.set(row, "42px");',
    "console.log(meta.get(row));               // F",
    "console.log(meta.size);                   // G",
    "const seen = new WeakSet([row]);",
    "console.log(seen.has({ id: 7 }));         // H",
    "row = null;",
  ],
  labels: ["A", "B", "C", "D", "E", "F", "G", "H"],
  answer: out,
  tiles: ["1", "2", "3", "4", "js,css,html", "js,css,js,css,html", "undefined", "undefined", "42px", "true", "false"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0], scopes: [{ ...tags, vars: tags.vars.slice(0, 2), fresh: true }], stack: [], out: [], phase: "Add", note: "The array has js twice. A Set keeps the first one and drops the repeat, so it starts with two values." },
    { lines: [1], scopes: [{ ...tags, changed: ["html"] }], stack: [], out: [], phase: "Add", note: "add returns the Set, so the calls chain. css is already in, so that add does nothing. html is new and goes on the end." },
    { lines: [2, 3], scopes: [tags], stack: [], out: out.slice(0, 2), phase: "Read", note: "size is a property, not a method: 3. Spreading a Set gives its values in the order they went in." },
    { lines: [5, 6, 7], scopes: [names(["home", "", "#1"]), { ...visits, vars: visits.vars.slice(0, 1), changed: ["#1"], fresh: true }, { ...home, fresh: true }], stack: [], out: out.slice(0, 2), phase: "Add", note: "A Map key can be any value, objects included. The key is that exact object, #1, not a description of it." },
    { lines: [8], scopes: [names(["home", "", "#1"]), { ...visits, changed: ["#2"] }, home, { ...copy, fresh: true }], stack: [], out: out.slice(0, 2), phase: "Add", note: "This literal makes a new object, #2. It looks the same as home, but it is a different object, so it gets an entry of its own." },
    { lines: [9, 10, 11], scopes: [names(["home", "", "#1"], ["get(…) arg", "", "#3"]), visits, home, copy, { name: "#3 object", vars: [["path", '"/"']], fresh: true }], stack: [], out: out.slice(0, 5), phase: "Read", note: "Two entries, so size is 2. The literal in get(...) is yet another new object, #3. No entry has an arrow to #3, so the answer is undefined. home is #1 itself, so get(home) finds 1." },
    { lines: [13, 14, 15], scopes: [names(["row", "", "#4"]), { ...meta, changed: ["#4"], fresh: true }, { ...row, fresh: true }], stack: [], out: out.slice(0, 5), phase: "Add", note: "A WeakMap takes only objects as keys. The entry is stored against the object row points at, #4, with a dashed arrow: it does not count as holding #4." },
    { lines: [16, 17], scopes: [names(["row", "", "#4"]), meta, row], stack: [], out: out.slice(0, 7), phase: "Read", note: "get works like Map's: 42px. But a WeakMap has no size. Its entries can disappear whenever the engine collects a key, so there is nothing stable to count, and reading a property that does not exist gives undefined." },
    { lines: [18, 19], scopes: [names(["row", "", "#4"], ["has(…) arg", "", "#5"]), meta, { ...seen, fresh: true }, row, { name: "#5 object", vars: [["id", "7"]], fresh: true }], stack: [], out, phase: "Read", note: "A WeakSet only answers yes or no. { id: 7 } is a brand-new object, #5. seen only has an arrow to #4, so the answer is false." },
    { lines: [20], scopes: [{ ...names(["row", "null"]), changed: ["row"] }, meta, seen, { ...row, kept: "unreachable: free to collect" }], stack: [], out, phase: "Collect", note: "row no longer points at #4, and only dashed arrows are left. Nothing can reach #4, so the engine may delete it, and both entries go with it. With a Map and a Set here, those arrows would be solid and #4 would stay in memory for good." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A 3, B js,css,html, C 2, D undefined, E 1, F 42px, G undefined, H false." },
  ],
};
