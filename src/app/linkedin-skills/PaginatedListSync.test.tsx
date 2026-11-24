import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { atRoute, renderWithStorage, storedList } from "@/test/appTestUtils";
import { earlyWarning, findings, ownership, quizCards, terms, testing, type FindingLinks } from "./data";
import PaginatedListSync from "./PaginatedListSync";

const tabs = () => within(screen.getByRole("tablist", { name: "Findings" })).getAllByRole("tab");
const panel = (n: number) => document.getElementById(`finding-panel-${n}`)!;
const visiblePanels = () => findings.filter((finding) => !panel(finding.n).hidden).map((finding) => finding.n);

function mount(deeper: FindingLinks = {}) {
  return render(<PaginatedListSync deeper={deeper} />);
}

beforeEach(() => {
  atRoute("/linkedin-skills");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("finding tabs", () => {
  test("one tab per finding, the first selected and the only one in the tab order", () => {
    mount();
    expect(tabs()).toHaveLength(findings.length);
    expect(tabs().map((tab) => tab.getAttribute("aria-selected"))).toEqual(["true", "false", "false", "false"]);
    expect(tabs().map((tab) => tab.tabIndex)).toEqual([0, -1, -1, -1]);
    expect(visiblePanels()).toEqual([1]);
  });

  test("tabs and panels reference each other", () => {
    mount();
    for (const [i, tab] of tabs().entries()) {
      const target = document.getElementById(tab.getAttribute("aria-controls")!)!;
      expect(target.getAttribute("role")).toBe("tabpanel");
      expect(target.getAttribute("aria-labelledby")).toBe(tab.id);
      expect(tab.id).toBe(`finding-tab-${findings[i].n}`);
    }
  });

  test("clicking a tab shows its panel and hides the rest, which stay in the document", () => {
    mount();
    fireEvent.click(tabs()[2]);
    expect(visiblePanels()).toEqual([3]);
    expect(findings.every((finding) => panel(finding.n) !== null)).toBe(true);
    expect(tabs()[2].tabIndex).toBe(0);
  });

  test("arrow keys move selection and focus, wrapping at both ends", () => {
    mount();
    fireEvent.keyDown(tabs()[0], { key: "ArrowLeft" });
    expect(visiblePanels()).toEqual([4]);
    expect(document.activeElement).toBe(tabs()[3]);
    fireEvent.keyDown(tabs()[3], { key: "ArrowRight" });
    expect(visiblePanels()).toEqual([1]);
    expect(document.activeElement).toBe(tabs()[0]);
    fireEvent.keyDown(tabs()[0], { key: "ArrowRight" });
    expect(visiblePanels()).toEqual([2]);
  });

  test("only the arrows are handled: they cancel the default, every other key is ignored", () => {
    mount();
    expect(fireEvent.keyDown(tabs()[0], { key: "ArrowRight" })).toBe(false);
    for (const key of ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "]) {
      expect(fireEvent.keyDown(tabs()[1], { key })).toBe(true);
    }
    expect(visiblePanels()).toEqual([2]);
  });

  test("each tab carries its finding number, short title and teaser", () => {
    mount();
    for (const [i, finding] of findings.entries()) {
      expect(tabs()[i].textContent).toBe(`Finding ${finding.n}${finding.short}${finding.teaser}`);
    }
  });
});

describe("finding body", () => {
  test.each(findings.map((finding) => [finding.n, finding] as const))(
    "finding %i shows what was seen, and an expectation or uncertainty only where authored",
    (n, finding) => {
      mount();
      const body = within(panel(n));
      expect(body.getByText("What I saw", { selector: "p" })).toBeDefined();
      expect(body.queryByText("What I expected", { selector: "p" }) !== null).toBe(Boolean(finding.expected));
      expect(body.queryByText("What I cannot tell", { selector: "p" }) !== null).toBe(Boolean(finding.unsure));
      expect(body.getByText("How I would build it", { selector: "p" })).toBeDefined();
    },
  );

  test("every guess is rendered as its own lead and phrased as a question", () => {
    mount();
    for (const finding of findings) {
      for (const guess of finding.guesses) {
        expect(within(panel(finding.n)).getByText(guess)).toBeDefined();
        expect(guess.endsWith("?")).toBe(true);
      }
    }
  });

  test("deep dives belong to findings 1, 2 and 4 only", () => {
    mount();
    expect(panel(1).querySelector("#offset")).not.toBeNull();
    expect(panel(2).querySelector("#design")).not.toBeNull();
    expect(panel(3).querySelector("#offset, #design")).toBeNull();
    expect(within(panel(3)).queryAllByRole("heading", { hidden: true })).toHaveLength(1);
    expect(within(panel(3)).queryByText("The rank a new record gets")).toBeNull();
    expect(within(panel(4)).getByText("The rank a new record gets")).toBeDefined();
    expect(panel(4).querySelectorAll("pre code")).toHaveLength(1);
  });
});

describe("Q&A links", () => {
  test("no links anywhere means no Q&A card anywhere", () => {
    mount({});
    for (const finding of findings) {
      expect(within(panel(finding.n)).queryByText("Already answered in the Q&A")).toBeNull();
    }
  });

  test("links land on the question with its topic encoded", () => {
    mount({ 2: [{ id: "s21", title: "What hydration costs", topic: "Next.js & build" }] });
    fireEvent.click(tabs()[1]);
    const link = within(panel(2)).getByRole("link", { name: "What hydration costs" });
    expect(link.getAttribute("href")).toBe("/interview-qa?q=s21&topic=Next.js%20%26%20build");
    expect(within(panel(1)).queryByText("Already answered in the Q&A")).toBeNull();
  });

  test("links keyed to a finding that does not exist are ignored", () => {
    mount({ 9: [{ id: "s1", title: "Orphan", topic: "JavaScript" }] });
    expect(screen.queryByText("Orphan")).toBeNull();
  });

  test("an empty list for a finding renders no card for it", () => {
    mount({ 1: [] });
    expect(within(panel(1)).queryByText("Already answered in the Q&A")).toBeNull();
  });
});

describe("test tiers", () => {
  const group = () => screen.getByRole("group", { name: "Test tier" });

  test("the first tier is shown, with its cases and what only it catches", () => {
    mount();
    const buttons = within(group()).getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual(testing.map((tier) => tier.tier));
    expect(buttons.map((button) => button.getAttribute("aria-pressed"))).toEqual(["true", "false", "false"]);
    expect(screen.getByText(testing[0].runs)).toBeDefined();
    for (const item of testing[0].cases) expect(screen.getByText(item)).toBeDefined();
    expect(screen.getByText(testing[0].catches, { exact: false })).toBeDefined();
  });

  test("choosing another tier swaps everything below it", () => {
    mount();
    fireEvent.click(within(group()).getByRole("button", { name: testing[2].tier }));
    expect(screen.queryByText(testing[0].runs)).toBeNull();
    expect(screen.getByText(testing[2].runs)).toBeDefined();
    expect(within(group()).getByRole("button", { name: testing[2].tier }).getAttribute("aria-pressed")).toBe("true");
  });

  test("choosing the active tier again keeps it", () => {
    mount();
    fireEvent.click(within(group()).getByRole("button", { name: testing[0].tier }));
    expect(screen.getByText(testing[0].runs)).toBeDefined();
  });
});

describe("early-warning guards", () => {
  const group = () => screen.getByRole("group", { name: "Guard" });

  test("one numbered chip per guard, the first showing its body", () => {
    mount();
    const chips = within(group()).getAllByRole("button");
    expect(chips.map((chip) => chip.textContent)).toEqual(earlyWarning.map((guard, i) => `0${i + 1}${guard.title}`));
    expect(screen.getByText(earlyWarning[0].body)).toBeDefined();
  });

  test("choosing a guard swaps the body and centres its chip on the track", () => {
    const scrollTo = vi.spyOn(Element.prototype, "scrollTo");
    mount();
    scrollTo.mockClear();
    const last = earlyWarning.at(-1)!;
    fireEvent.click(within(group()).getByRole("button", { name: new RegExp(last.title) }));
    expect(screen.getByText(last.body)).toBeDefined();
    expect(screen.queryByText(earlyWarning[0].body)).toBeNull();
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });

  test("with reduced motion the chip is centred without animation", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
    );
    const scrollTo = vi.spyOn(Element.prototype, "scrollTo");
    mount();
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
  });
});

describe("reference content", () => {
  test("every key term is a card titled with the term", () => {
    mount();
    for (const term of terms) {
      const cards = screen
        .getAllByText(term.title, { selector: "div" })
        .map((title) => title.parentElement!)
        .filter((card) => card.classList.contains("sd-card"));
      expect(cards).toHaveLength(1);
      expect(within(cards[0]).getByText(term.def)).toBeDefined();
    }
  });

  test("the three owners of list state are shown in their own colour", () => {
    mount();
    for (const row of ownership) {
      expect(screen.getByText(row.owner).getAttribute("style")).toContain(`color: ${row.color}`);
    }
  });

  test("the closing quiz uses the case study's own heading", () => {
    mount();
    expect(screen.getByText("Interview Prompts")).toBeDefined();
    expect(screen.getByText("Seven questions this case study answers")).toBeDefined();
    expect(screen.getByText(`Question 1 of ${quizCards.length}`)).toBeDefined();
  });

  test("both diagrams are titled images that share the page's arrow marker", () => {
    mount();
    const flow = screen.getByRole("img", { name: /^A loop in seven parts/ });
    const shift = screen.getByRole("img", { name: /^Eight skills in a row/ });
    expect(flow.querySelector("title")!.textContent).toBe("Where each piece of the list’s state could live");
    expect(shift.querySelector("title")!.textContent).toBe("Why a deleted record can make the next page skip one");
    expect(flow.querySelector("marker")!.id).toBe("pls-arrow");
  });

  test("the map-first link points at the frontend walkthrough", () => {
    mount();
    expect(screen.getByRole("link", { name: /Start here if you want the map first/ }).getAttribute("href")).toBe("/frontend");
  });
});

test("opening the page records a visit on its own route", () => {
  renderWithStorage(<PaginatedListSync deeper={{}} />);
  expect(storedList("sd-visited")).toContain("linkedin-skills");
});
