import type { Exercise, Scope } from "../closures/exercise";

const tags: Scope = { name: "tags, Set", vars: [["js", ""], ["css", ""], ["html", ""]] };
const ids: Scope = { name: "ids, Set", vars: [["#1", "", "#1"], ["#2", "", "#2"]] };
const one: Scope = { name: "#1 object", vars: [["id", "1"]] };
const two: Scope = { name: "#2 object", vars: [["id", "1"]] };
const names = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars });
const out = ["3", "js,css,html", "true", "2", "false", "true"];

export const EXERCISE: Exercise = {
  hint: "A Set keeps each value once, in the order it first went in. Objects are compared by identity, never by shape, so two identical-looking literals are two different values.",
  memory: "Sets and objects in memory (an arrow is a reference to one exact object)",
  code: [
    'const tags = new Set(["js", "css", "js"]);',
    'tags.add("css").add("html");',
    "console.log(tags.size);              // A",
    "console.log([...tags].join());       // B",
    'console.log(tags.has("js"));         // C',
    "",
    "const a = { id: 1 };",
    "const ids = new Set([a, { id: 1 }, a]);",
    "console.log(ids.size);               // D",
    "console.log(ids.has({ id: 1 }));     // E",
    "console.log(ids.has(a));             // F",
  ],
  labels: ["A", "B", "C", "D", "E", "F"],
  answer: out,
  tiles: ["1", "2", "3", "4", "js,css,html", "js,css,js,css,html", "true", "true", "false", "false", "undefined"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0], scopes: [{ ...tags, vars: tags.vars.slice(0, 2), fresh: true }], stack: [], out: [], phase: "Add", note: "The array has `\"js\"` twice. A Set keeps the first one and drops the repeat, so it starts with two values." },
    { lines: [1], scopes: [{ ...tags, changed: ["html"] }], stack: [], out: [], phase: "Add", note: "`add` returns the Set, so the calls chain. `\"css\"` is already in, so that `add` does nothing. `\"html\"` is new and goes on the end." },
    { lines: [2, 3, 4], scopes: [tags], stack: [], out: out.slice(0, 3), phase: "Read", note: "`size` is a property, not a method: `3`. Spreading a Set gives its values in the order they went in. `has` is a single lookup, no walking the list: `true`." },
    { lines: [6, 7], scopes: [names(["a", "", "#1"]), { ...ids, fresh: true }, { ...one, fresh: true }, { ...two, fresh: true }], stack: [], out: out.slice(0, 3), phase: "Add", note: "`{ id: 1 }` builds a new object, #2. It looks like #1, but it is a different object, so it is a new value. The second `a` is #1 again, already in, so it is dropped." },
    { lines: [8, 9, 10], scopes: [names(["a", "", "#1"], ["has(…) arg", "", "#3"]), ids, one, two, { name: "#3 object", vars: [["id", "1"]], fresh: true }], stack: [], out, phase: "Read", note: "Two members, so `size` is `2`. The literal in `has(…)` is yet another new object, #3, and nothing in the set points at it: `false`. `a` is #1 itself: `true`." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A 3, B js,css,html, C true, D 2, E false, F true." },
  ],
};

const set = (name: string, ...items: string[]): Scope => ({ name: `${name}, Set`, vars: items.map((item): Scope["vars"][number] => [item, ""]) });
const unique = ["2", "3,1,2", "b,c,a", "false", "4"];

export const EXTRA: Exercise = {
  hint: "A Set treats NaN as equal to NaN and 0 as equal to -0. Spreading a Set gives its values in insertion order, and a value that is deleted and added again goes to the back.",
  memory: "Sets in memory (each row is one stored value, in insertion order)",
  code: [
    "const s = new Set([NaN, NaN, 0, -0]);",
    "console.log(s.size);                      // A",
    "const nums = [3, 1, 3, 2, 1];",
    "console.log([...new Set(nums)].join());   // B",
    "",
    'const order = new Set(["a", "b", "c"]);',
    'order.delete("a");',
    'order.add("a");',
    "console.log([...order].join());           // C",
    'console.log(order.delete("z"));           // D',
    'const both = new Set([...order, "d"]);',
    "console.log(both.size);                   // E",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: unique,
  tiles: ["1", "2", "3", "4", "4", "3,1,2", "1,2,3", "a,b,c", "b,c,a", "true", "false"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1], scopes: [{ ...set("s", "NaN", "0"), fresh: true }], stack: [], out: unique.slice(0, 1), phase: "Add", note: "`NaN === NaN` is false, but a Set uses a rule where NaN matches itself, and 0 matches -0. Four inputs, two values." },
    { lines: [2, 3], scopes: [{ ...set("new Set(nums)", "3", "1", "2"), fresh: true }], stack: [], out: unique.slice(0, 2), phase: "Add", note: "The one-line dedupe. Each number is kept the first time it appears, so the order is 3, 1, 2, not sorted." },
    { lines: [5, 6, 7, 8], scopes: [{ ...set("order", "b", "c", "a"), changed: ["a"] }], stack: [], out: unique.slice(0, 3), phase: "Mutate", note: "Deleting `a` removes it entirely. Adding it again puts it at the back, so the order is now b, c, a." },
    { lines: [9], scopes: [set("order", "b", "c", "a")], stack: [], out: unique.slice(0, 4), phase: "Read", note: "`delete` returns whether something was removed. There is no `z`, so `false`." },
    { lines: [10, 11], scopes: [set("order", "b", "c", "a"), { ...set("both", "b", "c", "a", "d"), fresh: true }], stack: [], out: unique, phase: "Add", note: "Spreading a Set into a new one with an extra value is a union. Three values plus `d` makes four." },
    { lines: [], scopes: [], stack: [], out: unique, phase: "Done", note: "Final answers: A 2, B 3,1,2, C b,c,a, D false, E 4." },
  ],
};
