import type { Exercise, Scope } from "../closures/exercise";

const global = (count = "1"): Scope => ({ name: "Global", vars: [["update", "ƒ"], ["count", count], ["tags", "", "#1"]] });
const call = (count: string, items: string, extra: Partial<Scope> = {}): Scope => ({
  name: "update call",
  vars: [["count", count], ["items", "", items]],
  ...extra,
});
const one = (extra: Partial<Scope> = {}): Scope => ({ name: "#1 array", vars: [["0", '"js"']], ...extra });
const both = (extra: Partial<Scope> = {}): Scope => ({ name: "#1 array", vars: [["0", '"js"'], ["1", '"css"']], ...extra });
const out = ["html", "1", "js,css"];

export const EXERCISE: Exercise = {
  hint: "Every argument is copied into the parameter. For an object, what gets copied is the reference, so both names reach the same object until one of them is pointed somewhere else.",
  memory: "Variables and arrays in memory (an arrow is a reference: two arrows into one box means one shared array)",
  code: [
    "function update(count, items) {",
    "  count = 99;",
    '  items.push("css");',
    '  items = ["html"];',
    "  console.log(items.join()); // A",
    "}",
    "",
    "let count = 1;",
    'const tags = ["js"];',
    "",
    "update(count, tags);",
    "",
    "console.log(count);       // B",
    "console.log(tags.join()); // C",
  ],
  labels: ["A", "B", "C"],
  answer: out,
  tiles: ["1", "99", "html", "js", "js,css"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [7, 8], scopes: [global(), one({ fresh: true })], stack: [], out: [], phase: "Define", note: "`count` holds the number 1. `tags` holds an arrow to the array #1." },
    { lines: [10, 0], scopes: [global(), call("1", "#1", { fresh: true }), one()], stack: ["update()"], out: [], phase: "Call", note: "The update frame gets its own `count` with value 1. Both `tags` and `items` point to the same array, #1." },
    { lines: [1], scopes: [global(), call("99", "#1", { changed: ["count"] }), one()], stack: ["update()"], out: [], phase: "Reassign", note: "The function's `count` becomes 99. The outer `count` stays 1." },
    { lines: [2], scopes: [global(), call("99", "#1"), both({ changed: ["1"] })], stack: ["update()"], out: [], phase: "Mutate", note: '`items.push("css")` updates the shared array #1. Both arrows still point to it.' },
    { lines: [3, 4], scopes: [global(), call("99", "#2", { changed: ["items"] }), both(), { name: "#2 array", vars: [["0", '"html"']], fresh: true }], stack: ["update()"], out: out.slice(0, 1), phase: "Reassign", note: "Only the `items` arrow moves, to a new array #2. The `tags` arrow stays on #1. A prints `html`." },
    { lines: [12, 13], scopes: [global(), both()], stack: [], out, phase: "Return", note: "The update frame disappears. The outer `count` is still 1, and `tags` still reaches #1, which now holds js and css." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A html, B 1, C js,css." },
  ],
};

const top = (...vars: Scope["vars"]): Scope => ({ name: "Global", vars });
const ada = (name: string, extra: Partial<Scope> = {}): Scope => ({ name: "#1 object", vars: [["name", name]], ...extra });
const renamed = ["Ghost", "Lin", "Lin", "1"];

export const EXTRA: Exercise = {
  hint: "Setting a property through the parameter changes the shared object. Assigning to the parameter itself only moves the function's own arrow. A swap function cannot swap the caller's variables for the same reason.",
  memory: "Variables and objects in memory (an arrow is a reference: two arrows into one box means one shared object)",
  code: [
    "function rename(user, name) {",
    "  user.name = name;",
    '  name = "?";',
    '  user = { name: "Ghost" };',
    "  return user.name;",
    "}",
    "",
    'const ada = { name: "Ada" };',
    'let label = "Lin";',
    "console.log(rename(ada, label)); // A",
    "console.log(ada.name);           // B",
    "console.log(label);              // C",
    "",
    "function swap(a, b) { const t = a; a = b; b = t; }",
    "let x = [1], y = [2];",
    "swap(x, y);",
    "console.log(x[0]);               // D",
  ],
  labels: ["A", "B", "C", "D"],
  answer: renamed,
  tiles: ["Ghost", "Ada", "Lin", "Lin", "?", "1", "2"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [7, 8], scopes: [top(["rename", "ƒ"], ["ada", "", "#1"], ["label", '"Lin"']), ada('"Ada"', { fresh: true })], stack: [], out: [], phase: "Define", note: "`ada` holds an arrow to #1. `label` holds the string itself." },
    { lines: [9, 0], scopes: [top(["rename", "ƒ"], ["ada", "", "#1"], ["label", '"Lin"']), { name: "rename call", vars: [["user", "", "#1"], ["name", '"Lin"']], fresh: true }, ada('"Ada"')], stack: ["rename()"], out: [], phase: "Call", note: "`user` gets a copy of the arrow to #1. `name` gets a copy of the string." },
    { lines: [1], scopes: [top(["rename", "ƒ"], ["ada", "", "#1"], ["label", '"Lin"']), { name: "rename call", vars: [["user", "", "#1"], ["name", '"Lin"']] }, ada('"Lin"', { changed: ["name"] })], stack: ["rename()"], out: [], phase: "Mutate", note: "`user.name = name` follows the arrow and writes into #1, the object `ada` also points at." },
    { lines: [2, 3], scopes: [top(["rename", "ƒ"], ["ada", "", "#1"], ["label", '"Lin"']), { name: "rename call", vars: [["user", "", "#2"], ["name", '"?"']], changed: ["user", "name"] }, ada('"Lin"'), { name: "#2 object", vars: [["name", '"Ghost"']], fresh: true }], stack: ["rename()"], out: [], phase: "Reassign", note: "Both assignments change only the function's own variables. `label` is untouched, and `ada` still points at #1. `user` now points at a new object, #2." },
    { lines: [4, 9, 10, 11], scopes: [top(["rename", "ƒ"], ["ada", "", "#1"], ["label", '"Lin"']), ada('"Lin"')], stack: [], out: renamed.slice(0, 3), phase: "Return", note: "The function returns the name on #2, `Ghost`. Back outside, #1 kept the change made through the shared arrow, and `label` is still `Lin`." },
    { lines: [13, 14, 15, 16], scopes: [top(["swap", "ƒ"], ["x", "", "#3"], ["y", "", "#4"]), { name: "swap call", vars: [["a", "", "#4"], ["b", "", "#3"]], kept: "gone after the call" }, { name: "#3 array", vars: [["0", "1"]] }, { name: "#4 array", vars: [["0", "2"]] }], stack: [], out: renamed, phase: "Reassign", note: "`swap` crosses its own two arrows, `a` and `b`. The caller's `x` and `y` never move, so `x[0]` is still 1. With real pass by reference this swap would work." },
    { lines: [], scopes: [], stack: [], out: renamed, phase: "Done", note: "Final answers: A Ghost, B Lin, C Lin, D 1." },
  ],
};
