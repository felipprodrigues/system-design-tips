import type { Exercise, Scope } from "../closures/exercise";

const obj = (name: string, ...vars: Scope["vars"]): Scope => ({ name, vars });
const names = (...vars: Scope["vars"]): Scope => ({ name: "Variables", vars });

const original: Scope["vars"][number] = ["original", "", "#1"];
const alias: Scope["vars"][number] = ["alias", "", "#1"];
const shallow: Scope["vars"][number] = ["shallow", "", "#4"];
const deep: Scope["vars"][number] = ["deep", "", "#5"];
const o1 = (n = '"b"') => obj("#1 object", ["name", n], ["tags", "", "#2"], ["config", "", "#3"]);
const o2 = obj("#2 array", ["0", '"x"']);
const o3 = (theme = '"dark"') => obj("#3 object", ["theme", theme]);
const o4 = (n = '"b"') => obj("#4 object", ["name", n], ["tags", "", "#2"], ["config", "", "#3"]);
const deepTree: Scope[] = [
  obj("#5 object", ["name", '"b"'], ["tags", "", "#6"], ["config", "", "#7"]),
  obj("#6 array", ["0", '"x"'], ["1", '"y"']),
  obj("#7 object", ["theme", '"light"']),
];
const input = obj("#8 object", ["when", "Date(0)"], ["skip", "undefined"]);
const json = obj("#9 object", ["when", '"1970-01-01T00:00:00.000Z"']);

export const EXERCISE: Exercise = {
  hint: "Assigning an object copies the reference, never the object. A shallow copy makes a new outer object, but anything nested inside is still shared. A deep copy makes new objects all the way down.",
  memory: "Objects in memory (every arrow is a reference: two arrows into one box means one shared object)",
  code: [
    "const original = {",
    '  name: "a",',
    '  tags: ["x"],',
    '  config: { theme: "dark" },',
    "};",
    "const alias = original;",
    'alias.name = "b";',
    "console.log(original.name);             // A",
    "",
    "const shallow = { ...original };",
    'shallow.name = "c";',
    'shallow.config.theme = "light";',
    "console.log(original.name);             // B",
    "console.log(original.config.theme);     // C",
    "",
    "const deep = structuredClone(original);",
    'deep.tags.push("y");',
    "console.log(original.tags.length);      // D",
    "console.log(deep.config === original.config); // E",
    "console.log(shallow.tags === original.tags);   // F",
    "",
    "const input = { when: new Date(0), skip: undefined };",
    "const json = JSON.parse(JSON.stringify(input));",
    "console.log(typeof json.when);          // G",
    'console.log("skip" in json);            // H',
  ],
  labels: ["A", "B", "C", "D", "E", "F", "G", "H"],
  answer: ["b", "b", "light", "1", "false", "true", "string", "false"],
  tiles: ["a", "b", "b", "c", "dark", "light", "1", "2", "true", "false", "false", "string", "object"],
  steps: [
    { lines: [], scopes: [], stack: [], out: [], phase: "Start", note: "Nothing has run yet. Press Next to start." },
    { lines: [0, 1, 2, 3, 4], scopes: [names(original), { ...o1('"a"'), fresh: true }, { ...o2, fresh: true }, { ...o3(), fresh: true }], stack: [], out: [], phase: "Define", note: "One literal makes three objects: the outer one, the array and the config inside it. original holds an arrow to #1, not the object itself, and #1 holds arrows to #2 and #3." },
    { lines: [5, 6], scopes: [{ ...names(original, alias), changed: ["alias"] }, { ...o1(), changed: ["name"] }, o2, o3()], stack: [], out: [], phase: "Mutate", note: "const alias = original copies the arrow, not the object. Both names now point at #1, so alias.name = \"b\" changes the one object they share." },
    { lines: [7], scopes: [names(original, alias), o1(), o2, o3()], stack: [], out: ["b"], phase: "Read", note: "original.name follows its arrow to the same #1 that alias just changed, so it prints b." },
    { lines: [9], scopes: [{ ...names(original, alias, shallow), changed: ["shallow"] }, o1(), { ...o4(), fresh: true }, o2, o3()], stack: [], out: ["b"], phase: "Copy", note: "Spread makes a new outer object, #4, and copies each property one level deep. name holds a string, so the value is copied. tags and config hold arrows, and the arrows are copied: #4 points at the same #2 and #3 as #1." },
    { lines: [10, 11], scopes: [names(original, alias, shallow), o1(), { ...o4('"c"'), changed: ["name"] }, o2, { ...o3('"light"'), changed: ["theme"] }], stack: [], out: ["b"], phase: "Mutate", note: "shallow.name = \"c\" changes only #4. shallow.config.theme follows the shared arrow into #3, the same object original.config points at." },
    { lines: [12, 13], scopes: [names(original, alias, shallow), o1(), o4('"c"'), o2, o3('"light"')], stack: [], out: ["b", "b", "light"], phase: "Read", note: "original.name is still b: the copy never touched #1. original.config.theme reads #3, which the shallow copy changed, so it prints light." },
    { lines: [15, 16], scopes: [{ ...names(original, shallow, deep), changed: ["deep"] }, o1(), o4('"c"'), o2, o3('"light"'), ...deepTree.map((scope, i) => ({ ...scope, fresh: true, changed: i === 1 ? ["1"] : [] }))], stack: [], out: ["b", "b", "light"], phase: "Copy", note: "structuredClone walks the whole tree and copies every level: #5, #6 and #7 are all new, and no arrow leads back into the old tree. Pushing to deep.tags changes #6 only." },
    { lines: [17, 18, 19], scopes: [names(original, shallow, deep), o1(), o4('"c"'), o2, o3('"light"'), ...deepTree], stack: [], out: ["b", "b", "light", "1", "false", "true"], phase: "Read", note: "original.tags is still #2 with one item. deep.config is #7 and original.config is #3, two different boxes, so === is false. shallow.tags and original.tags both arrive at #2, so that one is true." },
    { lines: [21, 22], scopes: [names(["input", "", "#8"], ["json", "", "#9"]), input, { ...json, fresh: true }], stack: ["JSON.stringify()", "JSON.parse()"], out: ["b", "b", "light", "1", "false", "true"], phase: "Copy", note: "JSON.stringify turns the Date into an ISO string and leaves skip out, because JSON has no undefined. JSON.parse then builds a plain object from that text." },
    { lines: [23, 24], scopes: [names(["input", "", "#8"], ["json", "", "#9"]), input, json], stack: [], out: ["b", "b", "light", "1", "false", "true", "string", "false"], phase: "Read", note: "json.when is a string now, not a Date. skip was dropped on the way through, so it is not in json at all." },
    { lines: [], scopes: [], stack: [], out: ["b", "b", "light", "1", "false", "true", "string", "false"], phase: "Done", note: "Final answers: A b, B b, C light, D 1, E false, F true, G string, H false." },
  ],
};
