import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { atRoute, renderWithStorage, storedList } from "@/test/appTestUtils";
import { stages } from "./data";
import FrontendDesign, { type Deeper } from "./FrontendDesign";

const idOf = (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const status = () => screen.getByText(/^Stage \d of 9 · /);
const search = () => new URLSearchParams(window.location.search);
const withDeepDives = stages.find((stage) => stage.deepDives?.length)!;
const withoutDeepDives = stages.find((stage) => !stage.deepDives?.length)!;

function open(query = "", deeper: Deeper[] = []) {
  atRoute("/frontend", query);
  return renderWithStorage(<FrontendDesign deeper={deeper} />);
}

beforeEach(() => {
  document.documentElement.style.overflow = "";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the stage comes from the URL", () => {
  test("no query opens stage 1", () => {
    open();
    expect(status().textContent).toBe(`Stage 1 of 9 · Frame · ${stages[0].label}`);
  });

  test.each(["3", "9"])("?stage=%s opens that stage", (n) => {
    open(`?stage=${n}`);
    expect(status().textContent).toContain(`Stage ${n} of 9`);
    expect(status().textContent).toContain(stages[Number(n) - 1].label);
  });

  test.each(["0", "10", "-2", "abc", "", "Infinity"])("out of range or junk (?stage=%s) falls back to stage 1", (n) => {
    open(`?stage=${n}`);
    expect(status().textContent).toMatch(/^Stage 1 of 9/);
  });

  test("numeric parsing follows Number(), so a hex stage resolves", () => {
    open("?stage=0x3");
    expect(status().textContent).toMatch(/^Stage 3 of 9/);
  });

  test.fails("a fractional stage falls back to stage 1 (crashes today: stages[1.5] is undefined)", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    open("?stage=2.5");
    expect(status().textContent).toMatch(/^Stage 1 of 9/);
  });

  test("browser back/forward is honoured through popstate", () => {
    open();
    act(() => {
      window.history.replaceState(null, "", "/frontend?stage=4");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(status().textContent).toMatch(/^Stage 4 of 9/);
  });
});

describe("stepping between stages", () => {
  test("next and previous write the stage into the URL without adding history entries", () => {
    open();
    const before = window.history.length;
    fireEvent.click(screen.getByRole("button", { name: "Next stage" }));
    expect(search().get("stage")).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Previous stage" }));
    expect(search().get("stage")).toBe("1");
    expect(window.history.length).toBe(before);
  });

  test("previous is disabled on stage 1 and next on stage 9", () => {
    open();
    expect((screen.getByRole("button", { name: "Previous stage" }) as HTMLButtonElement).disabled).toBe(true);
    open("?stage=9");
    expect(screen.getAllByRole("button", { name: "Next stage" }).at(-1)!.hasAttribute("disabled")).toBe(true);
  });

  test("the first paint does not slide; stepping does, in the direction travelled", () => {
    const { container } = open("?stage=5");
    const card = () => container.querySelector("[data-dir]")!;
    expect(card().className).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Next stage" }));
    expect(card().getAttribute("data-dir")).toBe("fwd");
    expect(card().className).not.toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Previous stage" }));
    expect(card().getAttribute("data-dir")).toBe("back");
  });

  test("selecting the stage already showing changes nothing", () => {
    open("?stage=3");
    const row = screen.getByRole("button", { pressed: true, name: new RegExp(stages[2].label) });
    fireEvent.click(row);
    expect(search().get("stage")).toBe("3");
  });

  test("stage links inside the page jump and scroll the deck into view", () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    open();
    fireEvent.click(screen.getByRole("button", { name: `↑ Stage 7 · ${stages[6].label}` }));
    expect(search().get("stage")).toBe("7");
    expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  test("with reduced motion the jump scrolls instantly", () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
    );
    open();
    fireEvent.click(screen.getByRole("button", { name: `↑ Stage 5 · ${stages[4].label}` }));
    expect(scroll).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });
});

describe("stage selector layout", () => {
  test("rows by default, remembered as strip once chosen", () => {
    open();
    const group = screen.getByRole("group", { name: "Stage selector layout" });
    expect(within(group).getByRole("button", { name: "Rows" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(within(group).getByRole("button", { name: "One line" }));
    expect(within(group).getByRole("button", { name: "One line" }).getAttribute("aria-pressed")).toBe("true");
    expect(storedList("sd-stage-view")).toEqual(["strip"]);
  });

  test("a stored strip preference is restored and hides the rows", () => {
    atRoute("/frontend");
    const { container } = renderWithStorage(<FrontendDesign deeper={[]} />, { "sd-stage-view": ["strip"] });
    expect(screen.getByRole("button", { name: "One line" }).getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector("div[hidden]")).not.toBeNull();
  });

  test("an unrecognised stored value falls back to rows", () => {
    atRoute("/frontend");
    renderWithStorage(<FrontendDesign deeper={[]} />, { "sd-stage-view": ["columns"] });
    expect(screen.getByRole("button", { name: "Rows" }).getAttribute("aria-pressed")).toBe("true");
  });

  test("the strip centres the active chip on its track", () => {
    const scrollTo = vi.spyOn(Element.prototype, "scrollTo");
    atRoute("/frontend", "?stage=6");
    renderWithStorage(<FrontendDesign deeper={[]} />, { "sd-stage-view": ["strip"] });
    expect(scrollTo).toHaveBeenCalled();
    expect(scrollTo.mock.calls.at(-1)![0]).toMatchObject({ behavior: "smooth" });
  });
});

describe("decision cards", () => {
  const first = stages[0].checks[0];

  test("one card per decision for the active stage", () => {
    open("?stage=2");
    expect(screen.getAllByRole("button", { name: /^Mark ".*" as read$/ })).toHaveLength(stages[1].checks.length);
  });

  const cardOpen = () => screen.queryByText("How to answer it:") !== null;

  test("explain opens the card in the side panel, locks page scroll and records it in the URL", () => {
    open();
    expect(cardOpen()).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${first.q}`) }));
    expect(search().get("card")).toBe(idOf(first.q));
    expect(cardOpen()).toBe(true);
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  test("a card in the URL opens on load, and Escape closes it and clears the URL", () => {
    open(`?stage=1&card=${idOf(first.q)}`);
    expect(cardOpen()).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(cardOpen()).toBe(false);
    expect(search().has("card")).toBe(false);
    expect(search().get("stage")).toBe("1");
  });

  test.each([
    ["an unknown id", "nope"],
    ["a card from another stage", idOf(stages[4].checks[0].q)],
  ])("%s in the URL opens nothing", (_, card) => {
    open(`?stage=1&card=${card}`);
    expect(cardOpen()).toBe(false);
  });

  test("moving to another stage closes an open card", () => {
    open(`?stage=1&card=${idOf(first.q)}`);
    fireEvent.click(screen.getAllByRole("button", { name: "Next stage" })[0]);
    expect(cardOpen()).toBe(false);
    expect(search().has("card")).toBe(false);
    expect(search().get("stage")).toBe("2");
  });

  test("a decision seen in several places lists them; one seen once is a sentence", () => {
    const multi = stages[0].checks.find((check) => check.explain.seen.length > 1)!;
    const single = stages[0].checks.find((check) => check.explain.seen.length === 1)!;
    open(`?stage=1&card=${idOf(multi.q)}`);
    const panel = () => screen.getByText("Where you have met it").parentElement!;
    expect(panel().querySelectorAll("li")).toHaveLength(multi.explain.seen.length);
    open(`?stage=1&card=${idOf(single.q)}`);
    expect(screen.getAllByText("Where you have met it").at(-1)!.parentElement!.querySelector("ul")).toBeNull();
  });

  test("marking a card read toggles and persists it", () => {
    open();
    const tick = () => screen.getByRole("button", { name: `Mark "${first.q}" as read` });
    fireEvent.click(tick());
    expect(tick().getAttribute("aria-pressed")).toBe("true");
    expect(tick().closest("[data-read]")).not.toBeNull();
    expect(storedList("sd-fe-cards")).toEqual([idOf(first.q)]);
    fireEvent.click(tick());
    expect(tick().getAttribute("aria-pressed")).toBe("false");
    expect(storedList("sd-fe-cards")).toEqual([]);
  });

  test("list layout shows the same decisions as inline links that open the card", () => {
    open();
    fireEvent.click(within(screen.getByRole("group", { name: "Decision layout" })).getByRole("button", { name: "List" }));
    expect(screen.queryAllByRole("button", { name: /as read$/ })).toHaveLength(0);
    fireEvent.click(screen.getByTitle(`What does "${first.q}" mean?`));
    expect(search().get("card")).toBe(idOf(first.q));
  });

  test("every decision id is unique across the nine stages", () => {
    const ids = stages.flatMap((stage) => stage.checks.map((check) => idOf(check.q)));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))).toBe(true);
  });
});

describe("stage extras", () => {
  test("the analogy and deep dive appear only on stages that author them", () => {
    open(`?stage=${withoutDeepDives.n}`);
    expect(screen.queryByText("Think of it like")).toBeNull();
    expect(screen.queryByRole("button", { name: /^↗\s*Deep dive into/ })).toBeNull();
    open(`?stage=${withDeepDives.n}`);
    expect(screen.getAllByText("Think of it like").length).toBeGreaterThan(0);
  });

  test("the deep dive panel opens on its first section", () => {
    open(`?stage=${withDeepDives.n}`);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`Deep dive into ${withDeepDives.label.toLowerCase()}`) }));
    expect(screen.getByText(`Stage ${withDeepDives.n} deep dive`)).toBeDefined();
    const sections = withDeepDives.deepDives!.map((dive) => screen.getByRole("button", { name: new RegExp(dive.question) }));
    expect(sections[0].parentElement!.className).toMatch(/open/);
    expect(sections.slice(1).every((head) => !/open/.test(head.parentElement!.className))).toBe(true);
  });
});

describe("deeper reading", () => {
  test("nothing to go deeper into renders no stage groups", () => {
    open();
    expect(screen.queryAllByRole("link", { name: /./ }).filter((a) => a.getAttribute("href")?.startsWith("/interview-qa"))).toHaveLength(0);
  });

  test("links carry the question id and an encoded topic, and tags split two-subject topics", () => {
    open("", [
      {
        n: 4,
        questions: [
          { id: "s67", title: "Where does state live?", topic: "React" },
          { id: "s32", title: "How does the build split?", topic: "Next.js & build" },
          { id: "s25", title: "Another React one", topic: "React" },
        ],
      },
    ]);
    const link = screen.getByRole("link", { name: "How does the build split?" });
    expect(link.getAttribute("href")).toBe("/interview-qa?q=s32&topic=Next.js%20%26%20build");
    expect(screen.getByText(`Stage 4 · ${stages[3].label}`)).toBeDefined();
    const tags = screen.getByText("Next.js").parentElement!;
    expect([...tags.children].map((tag) => tag.textContent)).toEqual(["React", "Next.js", "Build"]);
  });
});

describe("page chrome", () => {
  test("breadcrumb, heading and the complete toggle on its own route", () => {
    open();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("A 9-step walkthrough to Frontend System Design");
    expect(screen.getByRole("link", { name: "Frontend Design" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("button", { name: "Complete" })).toBeDefined();
  });

  test("all three figures are labelled images", () => {
    open();
    for (const name of [/^The client stack at stage 1/, /^A plane with ownership/, /^Core Web Vitals thresholds/]) {
      expect(screen.getByRole("img", { name })).toBeDefined();
    }
  });

  test("the stack diagram keeps its stylesheet hook and arrow marker", () => {
    open();
    const stack = screen.getByRole("img", { name: /^The client stack/ });
    expect(stack.getAttribute("class")).toBeTruthy();
    expect(stack.querySelector("marker#sd-fe-arrow")).not.toBeNull();
  });
});

test("re-rendering the same stage keeps its state", () => {
  const { rerender } = open("?stage=2");
  rerender(<FrontendDesign deeper={[]} />);
  expect(status().textContent).toMatch(/^Stage 2 of 9/);
  render(<div />);
});
