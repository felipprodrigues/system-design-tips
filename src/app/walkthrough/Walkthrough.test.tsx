import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { bySlug } from "@/lib/concepts";
import { atRoute, renderWithStorage, storedList } from "@/test/appTestUtils";
import WalkthroughPage, { metadata } from "./page";
import Walkthrough from "./Walkthrough";

const LABELS = [
  "Clarify Requirements",
  "Estimate Capacity",
  "High-Level Design",
  "Database Design",
  "Interface Design",
  "Scalability and Performance",
  "Reliability and Resiliency",
];

const next = () => screen.getByRole("button", { name: "Next step" });
const prev = () => screen.getByRole("button", { name: "Previous step" });
const stepBox = (n: number) => screen.getByRole("button", { name: `Step ${n}, ${LABELS[n - 1]}` });
const status = () => screen.getByText(/^Step \d of 7 · /);
const design = () => screen.getByRole("img", { name: /^The design after step/ });
const nodeRect = (name: string) => within(design()).getByText(name).closest("g")!.querySelector("rect")!;

function goTo(n: number) {
  fireEvent.click(stepBox(n));
}

beforeEach(() => {
  atRoute("/walkthrough");
});

describe("stepper", () => {
  test("starts on step 1 with previous disabled", () => {
    render(<Walkthrough />);
    expect(status().textContent).toBe("Step 1 of 7 · Clarify Requirements");
    expect((prev() as HTMLButtonElement).disabled).toBe(true);
    expect((next() as HTMLButtonElement).disabled).toBe(false);
    expect(stepBox(1).getAttribute("aria-pressed")).toBe("true");
    expect(LABELS.slice(1).map((_, i) => stepBox(i + 2).getAttribute("aria-pressed"))).toEqual(
      Array(6).fill("false"),
    );
  });

  test("next walks every step and stops at 7", () => {
    render(<Walkthrough />);
    for (let n = 2; n <= 7; n++) {
      fireEvent.click(next());
      expect(status().textContent).toBe(`Step ${n} of 7 · ${LABELS[n - 1]}`);
    }
    expect((next() as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(next());
    fireEvent.click(next());
    expect(status().textContent).toMatch(/^Step 7 of 7/);
  });

  test("previous never goes below step 1", () => {
    render(<Walkthrough />);
    fireEvent.click(prev());
    expect(status().textContent).toMatch(/^Step 1 of 7/);
    goTo(3);
    fireEvent.click(prev());
    fireEvent.click(prev());
    fireEvent.click(prev());
    expect(status().textContent).toMatch(/^Step 1 of 7/);
  });

  test("clicking a step box jumps straight to it, forwards or back", () => {
    render(<Walkthrough />);
    goTo(6);
    expect(status().textContent).toBe("Step 6 of 7 · Scalability and Performance");
    goTo(2);
    expect(status().textContent).toBe("Step 2 of 7 · Estimate Capacity");
    expect(stepBox(2).getAttribute("aria-pressed")).toBe("true");
    expect(stepBox(6).getAttribute("aria-pressed")).toBe("false");
  });

  test("Enter and Space activate a step box and Space does not scroll the page", () => {
    render(<Walkthrough />);
    fireEvent.keyDown(stepBox(4), { key: "Enter" });
    expect(status().textContent).toMatch(/^Step 4 of 7/);
    const allowedDefault = fireEvent.keyDown(stepBox(5), { key: " " });
    expect(status().textContent).toMatch(/^Step 5 of 7/);
    expect(allowedDefault).toBe(false);
  });

  test("other keys leave the step alone", () => {
    render(<Walkthrough />);
    for (const key of ["a", "Tab", "ArrowRight", "Escape"]) fireEvent.keyDown(stepBox(3), { key });
    expect(status().textContent).toMatch(/^Step 1 of 7/);
  });

  test("step boxes are focusable", () => {
    render(<Walkthrough />);
    expect(LABELS.map((_, i) => stepBox(i + 1).getAttribute("tabindex"))).toEqual(Array(7).fill("0"));
  });

  test("steps already passed stay at full strength, later ones are faded", () => {
    render(<Walkthrough />);
    goTo(4);
    const opacity = (n: number) => stepBox(n).querySelector("rect")!.getAttribute("opacity");
    expect([1, 2, 3, 4].map(opacity)).toEqual(["1", "1", "1", "1"]);
    expect([5, 6, 7].map(opacity)).toEqual(["0.55", "0.55", "0.55"]);
  });
});

describe("the design diagram", () => {
  test("steps 1 and 2 draw nothing and say so", () => {
    render(<Walkthrough />);
    expect(within(design()).getByText("nothing drawn yet")).toBeDefined();
    goTo(2);
    expect(within(design()).getByText("nothing drawn yet")).toBeDefined();
    goTo(3);
    expect(within(design()).queryByText("nothing drawn yet")).toBeNull();
  });

  test("the accessible name carries the step and what it draws", () => {
    render(<Walkthrough />);
    expect(design().getAttribute("aria-label")).toMatch(/^The design after step 1\. Nothing yet\./);
    goTo(7);
    expect(design().getAttribute("aria-label")).toMatch(/^The design after step 7\. The last pass/);
  });

  test("a node is faded and dashed until the step that earns it", () => {
    render(<Walkthrough />);
    goTo(3);
    const cdn = nodeRect("CDN");
    expect(cdn.closest("g")!.getAttribute("opacity")).toBe("0.12");
    expect(cdn.getAttribute("stroke-dasharray")).toBe("4 4");
    goTo(6);
    expect(nodeRect("CDN").closest("g")!.getAttribute("opacity")).toBe("1");
    expect(nodeRect("CDN").getAttribute("stroke-dasharray")).toBeNull();
  });

  test("the pieces a step adds are ringed in teal, and the database is spotlit at step 4", () => {
    render(<Walkthrough />);
    goTo(3);
    expect(nodeRect("Client").getAttribute("stroke")).toBe("var(--sd-teal)");
    goTo(4);
    expect(nodeRect("Client").getAttribute("stroke")).toBe("var(--sd-border-strong)");
    expect(nodeRect("Database").getAttribute("stroke")).toBe("var(--sd-teal)");
    expect(nodeRect("Database").getAttribute("stroke-width")).toBe("2.5");
  });

  test("edge labels appear only once their edge is drawn", () => {
    render(<Walkthrough />);
    goTo(3);
    expect(within(design()).getByText("read / write")).toBeDefined();
    expect(within(design()).queryByText("publish")).toBeNull();
    expect(within(design()).queryByText("replicate")).toBeNull();
    goTo(6);
    expect(within(design()).getByText("publish")).toBeDefined();
    goTo(7);
    expect(within(design()).getByText("replicate")).toBeDefined();
  });

  test("drawn edges end in the diagram's own arrow marker, hidden ones in none", () => {
    render(<Walkthrough />);
    goTo(3);
    const paths = [...design().querySelectorAll("g > path")];
    const withMarker = paths.filter((path) => path.getAttribute("marker-end") === "url(#sd-hl-arrow)");
    const dashedHidden = paths.filter((path) => path.getAttribute("stroke-dasharray") === "4 4");
    expect(withMarker).toHaveLength(3);
    expect(dashedHidden.every((path) => path.getAttribute("marker-end") === null)).toBe(true);
    expect(design().querySelector("marker#sd-hl-arrow")).not.toBeNull();
  });

  test("the public interface frame only arrives with step 5", () => {
    render(<Walkthrough />);
    const frame = () => within(design()).getByText("PUBLIC INTERFACE").closest("g")!;
    goTo(4);
    expect(frame().getAttribute("opacity")).toBe("0.12");
    goTo(5);
    expect(frame().getAttribute("opacity")).toBe("1");
  });

  test("step 7 rings the load balancer in red and names it a single point of failure", () => {
    render(<Walkthrough />);
    goTo(6);
    expect(within(design()).queryByText("still a single point of failure")).toBeNull();
    goTo(7);
    expect(within(design()).getByText("still a single point of failure")).toBeDefined();
    expect(nodeRect("Load Balancer").getAttribute("stroke")).toBe("var(--sd-danger)");
    expect(nodeRect("Load Balancer").getAttribute("stroke-width")).toBe("2.5");
  });

  test("the stepper svg is a labelled group and carries both of its markers", () => {
    render(<Walkthrough />);
    const stepper = screen.getByRole("group", { name: /^Seven-step walkthrough/ });
    expect(stepper.querySelector("title")!.textContent).toBe("The seven-step walkthrough");
    expect([...stepper.querySelectorAll("marker")].map((marker) => marker.id)).toEqual(["sd-step-arrow", "sd-loop-arrow"]);
  });
});

describe("step detail", () => {
  test("what a step produces and where it goes wrong follow the active step", () => {
    render(<Walkthrough />);
    expect(screen.getByText(/Who uses this, for what/)).toBeDefined();
    goTo(2);
    expect(screen.queryByText(/Who uses this, for what/)).toBeNull();
    expect(screen.getByText(/single-server problem or a fleet problem/)).toBeDefined();
  });

  test("asterisked phrases are lifted into sd-strong emphasis", () => {
    render(<Walkthrough />);
    const card = screen.getByText("You walk away with").parentElement!;
    const strong = card.querySelector("strong.sd-strong");
    expect(strong?.textContent).toBe("do");
    expect(card.textContent).not.toContain("*");
  });
});

describe("content", () => {
  test("the hand-off table lists every edge between steps", () => {
    render(<Walkthrough />);
    const table = screen.getByRole("table", { name: "What each step hands the next" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(8);
    expect(within(rows[1]).getAllByRole("cell")[0].textContent).toBe("1 → 2");
    expect(within(rows[7]).getAllByRole("cell")[0].textContent).toBe("7 → 3");
  });

  test("every step links to a concept that exists", () => {
    render(<Walkthrough />);
    const links = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/concepts/"));
    expect(links).toHaveLength(7);
    for (const link of links) {
      expect(bySlug.has(link.getAttribute("href")!.replace("/concepts/", ""))).toBe(true);
    }
  });

  test("the outside reference opens in a new tab without leaking the opener", () => {
    render(<Walkthrough />);
    const link = screen.getByRole("link", { name: "system-design-101 repository" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  test("the quiz closes the page with all eight questions", () => {
    render(<Walkthrough />);
    expect(screen.getByText("Quiz Review")).toBeDefined();
    expect(screen.getByText("Question 1 of 8")).toBeDefined();
  });

  test("the breadcrumb names the method and leads back to the roadmap", () => {
    render(<Walkthrough />);
    expect(screen.getByRole("link", { name: "The Method" }).getAttribute("href")).toBe("/");
  });
});

describe("progress", () => {
  test("opening the page records a visit and offers to mark it complete", () => {
    renderWithStorage(<Walkthrough />);
    expect(storedList("sd-visited")).toContain("walkthrough");
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));
    expect(storedList("sd-completed")).toContain("walkthrough");
  });

  test("off its own route the complete toggle is not offered", () => {
    atRoute("/somewhere-else");
    render(<Walkthrough />);
    expect(screen.queryByRole("button", { name: /Complete/ })).toBeNull();
  });
});

describe("route", () => {
  test("metadata is canonical to /walkthrough and typed as an article", () => {
    expect(metadata.alternates?.canonical).toBe("/walkthrough");
    expect(metadata.openGraph).toMatchObject({ type: "article", url: "/walkthrough" });
    expect(metadata.title).toBe("A 7-Step Walkthrough for Any System Design");
  });

  test("the page renders the walkthrough", () => {
    render(<WalkthroughPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("A 7-Step Walkthrough for Any System Design");
  });
});
