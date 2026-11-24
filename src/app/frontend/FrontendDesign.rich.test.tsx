import type * as Data from "./data";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { atRoute, renderWithStorage } from "@/test/appTestUtils";
import { terms } from "./data";
import FrontendDesign from "./FrontendDesign";
import styles from "./Frontend.module.css";

const { CASES } = vi.hoisted(() => ({
  CASES: {
    emphasis: "*bold* then plain",
    code: "run `inline` or `line1\nline2`",
    glossary: "renders on the [SSR] path, not [Not a term]",
    unclosedStar: "ends with *unclosed",
    emptyPair: "an empty ** pair",
    unclosedTick: "a `unclosed tick",
    nested: "*see [SSR]*",
    pairing: "a stray * star and *real*",
  } as Record<string, string>,
}));

vi.mock("./data", async (importOriginal) => {
  const actual = await importOriginal<typeof Data>();
  const [first, ...rest] = actual.stages;
  const checks = Object.entries(CASES).map(([q, a]) => ({ ...first.checks[0], q: `case-${q}`, a }));
  return { ...actual, stages: [{ ...first, checks }, ...rest] };
});

const card = (name: string) => screen.getByRole("button", { name: new RegExp(`^case-${name}`) });
const strongs = (name: string) => [...card(name).querySelectorAll("strong.sd-strong")].map((node) => node.textContent);
const body = (name: string) => card(name).textContent!.replace(`case-${name}`, "").replace("Explain this →", "");

beforeEach(() => {
  atRoute("/frontend");
  renderWithStorage(<FrontendDesign deeper={[]} />);
});

describe("rich() markup in authored copy", () => {
  test("*asterisks* become sd-strong emphasis without the markers", () => {
    expect(strongs("emphasis")).toEqual(["bold"]);
    expect(body("emphasis")).toBe("bold then plain");
  });

  test("backticks become inline code, and a snippet with a line break becomes a block", () => {
    const codes = [...card("code").querySelectorAll("code")];
    expect(codes.map((code) => code.textContent)).toEqual(["inline", "line1\nline2"]);
    expect(codes[0].className).toBe(styles.code);
    expect(codes[1].className).toBe(styles.codeBlock);
  });

  test("[Label] with a glossary entry becomes a Term carrying the definition", () => {
    const term = card("glossary").querySelector(".sd-term")!;
    expect(term.firstChild?.textContent).toBe("SSR");
    expect(term.getAttribute("tabindex")).toBe("0");
    expect(term.querySelector("[role=tooltip]")!.textContent).toBe(terms.SSR);
  });

  test("[Label] with no glossary entry renders plain text without the brackets", () => {
    expect(card("glossary").querySelectorAll(".sd-term")).toHaveLength(1);
    expect(body("glossary")).toContain("not Not a term");
    expect(body("glossary")).not.toContain("[");
  });

  test("a lone asterisk, an empty pair and an unclosed backtick are left as typed", () => {
    expect(body("unclosedStar")).toBe("ends with *unclosed");
    expect(strongs("unclosedStar")).toEqual([]);
    expect(body("emptyPair")).toBe("an empty ** pair");
    expect(body("unclosedTick")).toBe("a `unclosed tick");
    expect(card("unclosedTick").querySelector("code")).toBeNull();
  });

  test("markup does not nest: a term inside emphasis stays literal", () => {
    expect(strongs("nested")).toEqual(["see [SSR]"]);
    expect(card("nested").querySelector(".sd-term")).toBeNull();
  });

  test("asterisks pair left to right, so a stray one captures up to the next", () => {
    expect(strongs("pairing")).toEqual([" star and "]);
    expect(body("pairing")).toBe("a stray  star and real*");
  });
});
