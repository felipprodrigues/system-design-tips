import type { Exercise, Scope } from "../closures/exercise";

const visits = (first = "1"): Scope => ({ name: "visits, Map", vars: [["#1", first, "#1"], ["#2", "2", "#2"]] });
const home: Scope = { name: "#1 object", vars: [["path", '"/"']] };
const copy: Scope = { name: "#2 object", vars: [["path", '"/"']] };
const names = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars });
const out = ["2", "undefined", "1", "2", "3,2"];

export const EXERCISE: Exercise = {
  hint: "A Map stores a value under a key and hands it back by that same key. Object keys match by identity, never by shape. Setting a key that is already there replaces its value and keeps its place.",
  memory: "The Map and its keys in memory (each entry points at the exact object it is keyed by)",
  code: [
    "const visits = new Map();",
    'const home = { path: "/" };',
    "visits.set(home, 1);",
    'visits.set({ path: "/" }, 2);',
    "console.log(visits.size);                  // A",
    'console.log(visits.get({ path: "/" }));    // B',
    "console.log(visits.get(home));             // C",
    "",
    "visits.set(home, 3);",
    "console.log(visits.size);                  // D",
    "console.log([...visits.values()].join());  // E",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: out,
  tiles: ["1", "2", "2", "3", "undefined", "null", "3,2", "2,3", "1,2,3"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2], scopes: [names(["home", "", "#1"]), { ...visits(), vars: visits().vars.slice(0, 1), changed: ["#1"], fresh: true }, { ...home, fresh: true }], stack: [], out: [], phase: "Add", note: "A Map key can be any value, objects included. The key is that exact object, #1, not a copy of it or a string made from it." },
    { lines: [3], scopes: [names(["home", "", "#1"]), { ...visits(), changed: ["#2"] }, home, { ...copy, fresh: true }], stack: [], out: [], phase: "Add", note: "This literal makes a new object, #2. It looks the same as `home`, but it is a different object, so it gets an entry of its own." },
    { lines: [4, 5, 6], scopes: [names(["home", "", "#1"], ["get(…) arg", "", "#3"]), visits(), home, copy, { name: "#3 object", vars: [["path", '"/"']], fresh: true }], stack: [], out: out.slice(0, 3), phase: "Read", note: "Two entries, so `size` is `2`. The literal in `get(…)` is yet another new object, #3. No entry points at #3, so the answer is `undefined`. `home` is #1 itself, so `get(home)` finds `1`." },
    { lines: [8], scopes: [names(["home", "", "#1"]), { ...visits("3"), changed: ["#1"] }, home, copy], stack: [], out: out.slice(0, 3), phase: "Update", note: "`set` on a key that is already there replaces the value. It does not add a second entry, and the entry keeps its place in the order." },
    { lines: [9, 10], scopes: [names(["home", "", "#1"]), visits("3"), home, copy], stack: [], out, phase: "Read", note: "Still two entries, so `size` is `2`. `values()` walks the entries in insertion order. #1 went in first, so its new value comes first: `3,2`." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A 2, B undefined, C 1, D 2, E 3,2." },
  ],
};

const m = (...entries: Scope["vars"]): Scope => ({ name: "m, Map", vars: entries });
const typed = ["2", "num", "1", "nan", "1,NaN"];

export const EXTRA: Exercise = {
  hint: "A Map keeps a key's type: the number 1 and the string \"1\" are two keys. An object turns every key into a string. A Map also matches NaN with NaN, and keeps insertion order.",
  memory: "The Map and a plain object in memory (each row is key, then value)",
  code: [
    'const m = new Map([[1, "num"], ["1", "str"]]);',
    "console.log(m.size);                      // A",
    "console.log(m.get(1));                    // B",
    "",
    'const o = { 1: "num" };',
    'o["1"] = "str";',
    "console.log(Object.keys(o).length);       // C",
    "",
    'm.set(NaN, "nan");',
    "console.log(m.get(NaN));                  // D",
    "m.delete(1);",
    "console.log([...m.keys()].join());        // E",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: typed,
  tiles: ["1", "1", "2", "num", "str", "nan", "undefined", "1,NaN", "1,1,NaN"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2], scopes: [{ ...m(["1 (number)", '"num"'], ['"1" (string)', '"str"']), fresh: true }], stack: [], out: typed.slice(0, 2), phase: "Add", note: "The number 1 and the string \"1\" are different keys in a Map, so there are two entries, and `get(1)` finds the number one." },
    { lines: [4, 5, 6], scopes: [m(["1 (number)", '"num"'], ['"1" (string)', '"str"']), { name: "o, object", vars: [['"1"', '"str"']], fresh: true, changed: ['"1"'] }], stack: [], out: typed.slice(0, 3), phase: "Mutate", note: "Object keys are always strings. The literal's `1` was already stored as \"1\", so the assignment overwrote it: one key." },
    { lines: [8, 9], scopes: [{ ...m(["1 (number)", '"num"'], ['"1" (string)', '"str"'], ["NaN", '"nan"']), changed: ["NaN"] }], stack: [], out: typed.slice(0, 4), phase: "Add", note: "Even though `NaN !== NaN`, a Map treats NaN as one key, so `get(NaN)` finds it." },
    { lines: [10, 11], scopes: [m(['"1" (string)', '"str"'], ["NaN", '"nan"'])], stack: [], out: typed, phase: "Mutate", note: "Deleting the number key leaves the string \"1\" and NaN, still in insertion order." },
    { lines: [], scopes: [], stack: [], out: typed, phase: "Done", note: "Final answers: A 2, B num, C 1, D nan, E 1,NaN." },
  ],
};
