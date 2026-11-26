import type { Exercise, Scope } from "../closures/exercise";

const obj = (name: string, ...vars: Scope["vars"]): Scope => ({ name, vars });
const names: Scope = { name: "Variables", vars: [["animal", "", "#1"], ["dog", "", "#2"], ["rex", "", "#3"]] };
const base = obj("Object.prototype", ["hasOwnProperty", "ƒ"], ["[[Prototype]]", "null"]);
const animal = (...extra: Scope["vars"]) => obj("#1 object", ["eat", "ƒ"], ...extra, ["[[Prototype]]", "", "Object.prototype"]);
const dog = obj("#2 object", ["bark", "ƒ"], ["[[Prototype]]", "", "#1"]);
const rex = (...extra: Scope["vars"]) => obj("#3 object", ["name", '"Rex"'], ...extra, ["[[Prototype]]", "", "#2"]);
const sleep: Scope["vars"][number] = ["sleep", "ƒ"];
const out = ["Rex eats", "false", "true", "Rex sleeps", "Rex gulps", "Rex eats", "function", "true"];

export const EXERCISE: Exercise = {
  hint: "A missing property is looked up on the prototype, then its prototype, until null. Nothing is copied: the link is live, so a change to an ancestor shows up at once, and an own property hides the inherited one. class builds the same chain.",
  memory: "The prototype chain (follow [[Prototype]] upward to see where a lookup ends)",
  code: [
    "const animal = { eat() { return `${this.name} eats`; } };",
    "const dog = Object.create(animal);",
    'dog.bark = () => "Woof";',
    "const rex = Object.create(dog);",
    'rex.name = "Rex";',
    "",
    "console.log(rex.eat());                  // A",
    'console.log(rex.hasOwnProperty("eat"));  // B',
    'console.log("bark" in rex);              // C',
    "",
    "animal.sleep = function () { return `${this.name} sleeps`; };",
    "console.log(rex.sleep());                // D",
    "",
    'rex.eat = () => "Rex gulps";',
    "console.log(rex.eat());                  // E",
    "delete rex.eat;",
    "console.log(rex.eat());                  // F",
    "",
    "class Animal {",
    '  eat() { return "eats"; }',
    "}",
    "class Dog extends Animal {}",
    "console.log(typeof Dog);                 // G",
    "console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // H",
  ],
  labels: ["A", "B", "C", "D", "E", "F", "G", "H"],
  answer: out,
  tiles: ["Rex eats", "Rex eats", "undefined eats", "true", "true", "false", "false", "Rex sleeps", "Rex gulps", "function", "object"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2, 3, 4], scopes: [names, { ...rex(), fresh: true }, { ...dog, fresh: true }, { ...animal(), fresh: true }, base], stack: [], out: [], phase: "Define", note: "`Object.create(x)` makes an empty object whose prototype is `x`. The chain runs #3 to #2 to #1 to `Object.prototype` to `null`." },
    { lines: [6, 7, 8], scopes: [names, rex(), dog, animal(), base], stack: ["eat()"], out: out.slice(0, 3), phase: "Read", note: "#3 has no `eat`, nor does #2, so the lookup finds it on #1, and `this` is still #3: `Rex eats`. `hasOwnProperty` only checks #3 itself: `false`. `in` walks the chain and finds `bark` on #2: `true`." },
    { lines: [10, 11], scopes: [names, rex(), dog, { ...animal(sleep), changed: ["sleep"] }, base], stack: ["sleep()"], out: out.slice(0, 4), phase: "Mutate", note: "`sleep` is added to #1 after #3 was made. The link is live, so the next lookup from #3 finds it straight away." },
    { lines: [13, 14], scopes: [names, { ...rex(["eat", "ƒ (own)"]), changed: ["eat"] }, dog, animal(sleep), base], stack: ["eat()"], out: out.slice(0, 5), phase: "Mutate", note: "Assigning `rex.eat` creates an own property on #3. The lookup stops at the first match, so it hides the one on #1 without touching it." },
    { lines: [15, 16], scopes: [names, rex(), dog, animal(sleep), base], stack: ["eat()"], out: out.slice(0, 6), phase: "Mutate", note: "Delete the own property and the inherited `eat` on #1 is visible again." },
    { lines: [18, 19, 20, 21, 22, 23], scopes: [{ name: "Variables", vars: [["Animal", "ƒ", "Animal.prototype"], ["Dog", "ƒ", "Dog.prototype"]] }, { ...obj("Dog.prototype", ["[[Prototype]]", "", "Animal.prototype"]), fresh: true }, { ...obj("Animal.prototype", ["eat", "ƒ"], ["[[Prototype]]", "", "Object.prototype"]), fresh: true }, base], stack: [], out, phase: "Define", note: "`class` is a function underneath: `typeof Dog` is `function`. `extends` just points `Dog.prototype` at `Animal.prototype`, the same chain as above." },
    { lines: [], scopes: [], stack: [], out, phase: "Done", note: "Final answers: A Rex eats, B false, C true, D Rex sleeps, E Rex gulps, F Rex eats, G function, H true." },
  ],
};

const kids: Scope = { name: "Variables", vars: [["base", "", "#1"], ["a", "", "#2"], ["b", "", "#3"]] };
const parent = obj("#1 object", ["tags", "", "#4"], ["count", "0"], ["[[Prototype]]", "", "Object.prototype"]);
const kidA = (...own: Scope["vars"]) => obj("#2 object", ...own, ["[[Prototype]]", "", "#1"]);
const kidB = obj("#3 object", ["[[Prototype]]", "", "#1"]);
const tags = (...items: Scope["vars"]) => obj("#4 array", ...items);
const gotchas = ["1 0", "1", "true", "false", "false"];

export const EXTRA: Exercise = {
  hint: "Reading follows the chain, but assigning always creates an own property on the object you assign to. Mutating an inherited object does not assign anything, so every child sees the change. instanceof checks the constructor's current prototype.",
  memory: "The prototype chain (follow [[Prototype]] upward to see where a lookup ends)",
  code: [
    "const base = { tags: [], count: 0 };",
    "const a = Object.create(base);",
    "const b = Object.create(base);",
    "",
    "a.count++;",
    "console.log(a.count, b.count);          // A",
    'a.tags.push("x");',
    "console.log(b.tags.length);             // B",
    'console.log(a.hasOwnProperty("count")); // C',
    'console.log(a.hasOwnProperty("tags"));  // D',
    "",
    "function Cat() {}",
    "const tom = new Cat();",
    "Cat.prototype = {};",
    "console.log(tom instanceof Cat);        // E",
  ],
  labels: ["A", "B", "C", "D", "E"],
  answer: gotchas,
  tiles: ["1 0", "1 1", "0 0", "0", "1", "true", "true", "false", "false"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2], scopes: [kids, { ...kidA(), fresh: true }, { ...kidB, fresh: true }, { ...parent, fresh: true }, { ...tags(["length", "0"]), fresh: true }], stack: [], out: [], phase: "Define", note: "#2 and #3 are empty and both link to #1, which holds `count` and an arrow to the array #4." },
    { lines: [4, 5], scopes: [kids, { ...kidA(["count", "1 (own)"]), changed: ["count"] }, kidB, parent, tags(["length", "0"])], stack: [], out: gotchas.slice(0, 1), phase: "Mutate", note: "`a.count++` reads 0 through the chain, then assigns 1. Assignment creates an own `count` on #2 and leaves #1 alone, so `b.count` is still 0." },
    { lines: [6, 7], scopes: [kids, kidA(["count", "1 (own)"]), kidB, parent, { ...tags(["0", '"x"'], ["length", "1"]), changed: ["0", "length"] }], stack: [], out: gotchas.slice(0, 2), phase: "Mutate", note: "`a.tags.push` only reads `tags`, finds #4 on #1, and changes that array. Nothing was assigned to `a`, so #3 sees the same array. This is why shared state on a prototype is a trap." },
    { lines: [8, 9], scopes: [kids, kidA(["count", "1 (own)"]), kidB, parent, tags(["0", '"x"'], ["length", "1"])], stack: [], out: gotchas.slice(0, 4), phase: "Read", note: "#2 owns `count` now, but `tags` is still borrowed from #1." },
    { lines: [11, 12, 13, 14], scopes: [{ name: "Variables", vars: [["Cat", "ƒ", "#6"], ["tom", "", "#5"]] }, { ...obj("#5 object", ["[[Prototype]]", "", "#7"]), fresh: true }, { ...obj("#6 object", ["role", "new Cat.prototype"]), fresh: true }, { ...obj("#7 object", ["role", "old Cat.prototype"]), kept: "only tom links here" }], stack: [], out: gotchas, phase: "Reassign", note: "`tom` was linked to the old prototype, #7. Replacing `Cat.prototype` with #6 does not move that link, and `instanceof` looks for the current `Cat.prototype` on tom's chain, so `false`." },
    { lines: [], scopes: [], stack: [], out: gotchas, phase: "Done", note: "Final answers: A 1 0, B 1, C true, D false, E false." },
  ],
};
