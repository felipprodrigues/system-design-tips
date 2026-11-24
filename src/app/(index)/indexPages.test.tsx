import type * as Fs from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SHELVES } from "@/lib/caseStudies";
import { parseSections } from "@/lib/interviewPrep";
import { atRoute, renderWithStorage } from "@/test/appTestUtils";
import { setMockNavigation } from "../../../.storybook/mocks/next-navigation";
import AboutPage, { metadata as aboutMetadata } from "./about/page";
import CaseStudiesPage, { metadata as caseStudiesMetadata } from "../case-studies/page";
import InterviewQAPage, { metadata as interviewMetadata } from "./interview-qa/page";
import IndexLayout from "./layout";
import styles from "./layout.module.css";
import Home from "./page";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof Fs>();
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) };
});

const actualFs = await vi.importActual<typeof Fs>("node:fs");
const realCount = parseSections(actualFs.readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8")).length;
const DOC = (n: number) =>
  Array.from({ length: n }, (_, i) => `<h2 id="s${i + 1}">${i + 1}. Question ${i + 1}</h2><p>Answer.</p>`).join("");

function withDocument(html: string) {
  vi.mocked(readFileSync).mockImplementation(((path: Parameters<typeof readFileSync>[0], options?: unknown) =>
    String(path).endsWith("interview-qa.html")
      ? html
      : actualFs.readFileSync(path, options as BufferEncoding)) as typeof readFileSync);
}

beforeEach(() => {
  vi.mocked(readFileSync).mockClear();
});

afterEach(() => {
  vi.mocked(readFileSync).mockImplementation(actualFs.readFileSync);
});

describe("(index) layout", () => {
  test("wraps every top-level page in the shared content column", () => {
    const { container } = render(
      <IndexLayout params={Promise.resolve({})}>
        <p>child</p>
      </IndexLayout>,
    );
    const outer = container.firstElementChild!;
    expect(outer.className).toBe(styles.page);
    expect(outer.firstElementChild!.className).toBe(styles.inner);
    expect(outer.firstElementChild!.textContent).toBe("child");
  });

  test("renders an empty column when a page has nothing", () => {
    const { container } = render(<IndexLayout params={Promise.resolve({})}>{null}</IndexLayout>);
    expect(container.querySelector(`.${styles.inner}`)!.childNodes).toHaveLength(0);
  });
});

describe("/ (roadmap)", () => {
  test("announces the real number of interview questions", () => {
    atRoute("/");
    renderWithStorage(<Home />);
    expect(screen.getByText(`${realCount} questions`)).toBeDefined();
  });

  test("the count follows the document, however many sections it has", () => {
    withDocument(DOC(3));
    atRoute("/");
    renderWithStorage(<Home />);
    expect(screen.getByText("3 questions")).toBeDefined();
  });

  test("an empty document reads as zero questions rather than failing", () => {
    withDocument("");
    atRoute("/");
    renderWithStorage(<Home />);
    expect(screen.getByText("0 questions")).toBeDefined();
  });
});

describe("/about", () => {
  test("metadata is canonical to /about and typed as a profile", () => {
    expect(aboutMetadata.title).toBe("About");
    expect(aboutMetadata.alternates?.canonical).toBe("/about");
    expect(aboutMetadata.openGraph).toMatchObject({ type: "profile", url: "/about" });
  });

  test("the hero, both columns and the availability card render", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Who's behind this");
    expect(screen.getByRole("heading", { level: 2, name: "The person" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "The project" })).toBeDefined();
    expect(screen.getByRole("region", { name: "Availability" })).toBeDefined();
  });

  test("every outbound link opens in a new tab without the opener; email does not", () => {
    render(<AboutPage />);
    const links = within(screen.getByRole("region", { name: "Availability" })).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["LinkedIn", "Email", "GitHub", "Buy me a coffee"]);
    for (const link of links) {
      const href = link.getAttribute("href")!;
      if (href.startsWith("mailto:")) {
        expect(link.hasAttribute("target")).toBe(false);
      } else {
        expect(href.startsWith("https://")).toBe(true);
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      }
    }
  });

  test("decorative artwork and brand marks are hidden from assistive tech", () => {
    const { container } = render(<AboutPage />);
    const svgs = [...container.querySelectorAll("svg")];
    expect(svgs.length).toBeGreaterThan(3);
    expect(svgs.every((svg) => svg.getAttribute("aria-hidden") === "true")).toBe(true);
  });
});

describe("/case-studies", () => {
  test("metadata is canonical to /case-studies", () => {
    expect(caseStudiesMetadata.alternates?.canonical).toBe("/case-studies");
    expect(caseStudiesMetadata.openGraph).toMatchObject({ type: "website", url: "/case-studies" });
  });

  test("with no shelf chosen, the hero sits above one picker per shelf", () => {
    setMockNavigation({ pathname: "/case-studies" });
    render(<CaseStudiesPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("System blueprints");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    for (const shelf of Object.values(SHELVES)) {
      expect(screen.getByRole("button", { name: new RegExp(shelf.title) })).toBeDefined();
    }
  });

  test("a chosen shelf lists every study on it", () => {
    setMockNavigation({ pathname: "/case-studies", query: { set: "systems" } });
    render(<CaseStudiesPage />);
    expect(screen.getAllByRole("article")).toHaveLength(SHELVES.systems.studies.length);
    setMockNavigation({ pathname: "/" });
  });
});

describe("/interview-qa", () => {
  test("metadata is canonical to /interview-qa", () => {
    expect(interviewMetadata.alternates?.canonical).toBe("/interview-qa");
    expect(interviewMetadata.openGraph).toMatchObject({ url: "/interview-qa" });
  });

  test("the hero counts the questions the page actually parsed", () => {
    atRoute("/interview-qa");
    renderWithStorage(<InterviewQAPage />);
    expect(screen.getByText(new RegExp(`^${realCount} frontend interview questions`))).toBeDefined();
    expect(screen.getByRole("button", { name: "Complete" })).toBeDefined();
  });

  test("the document is read on every render, so edits show up without a restart", () => {
    atRoute("/interview-qa");
    const { rerender } = render(<InterviewQAPage />);
    const reads = () =>
      vi.mocked(readFileSync).mock.calls.filter(([path]) => String(path).endsWith("interview-qa.html")).length;
    const first = reads();
    rerender(<InterviewQAPage />);
    expect(first).toBeGreaterThan(0);
    expect(reads()).toBe(first * 2);
  });

  test("with a smaller document the hero and contents follow it", () => {
    withDocument(DOC(2));
    atRoute("/interview-qa");
    render(<InterviewQAPage />);
    expect(screen.getByText(/^2 frontend interview questions/)).toBeDefined();
  });
});
