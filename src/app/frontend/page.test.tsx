import type * as Fs from "node:fs";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, test, vi } from "vitest";
import { atRoute } from "@/test/appTestUtils";
import { deeper, stages } from "./data";
import FrontendDesignPage, { metadata } from "./page";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof Fs>();
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) };
});

const qaLinks = () =>
  screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/interview-qa?q="));

const actualFs = await vi.importActual<typeof Fs>("node:fs");

function withDocument(html: string) {
  vi.mocked(readFileSync).mockImplementation(((path: Parameters<typeof readFileSync>[0], options?: unknown) =>
    String(path).endsWith("interview-qa.html")
      ? html
      : actualFs.readFileSync(path, options as BufferEncoding)) as typeof readFileSync);
}

afterEach(() => {
  vi.mocked(readFileSync).mockImplementation(actualFs.readFileSync);
});

describe("/frontend route", () => {
  test("every authored question number resolves against the real Q&A document", () => {
    atRoute("/frontend");
    render(<FrontendDesignPage />);
    expect(qaLinks()).toHaveLength(deeper.reduce((sum, entry) => sum + entry.ids.length, 0));
  });

  test("a number missing from the document is dropped, and a stage left with none disappears", () => {
    withDocument(
      '<h2 id="s21">21. Hydration, explained</h2><p>x</p><h2 id="s56">56. A mock round</h2><p>y</p>',
    );
    atRoute("/frontend");
    render(<FrontendDesignPage />);
    expect(qaLinks().map((link) => link.textContent)).toEqual(["Hydration, explained", "A mock round"]);
    expect(screen.getByText(`Stage 2 · ${stages[1].label}`)).toBeDefined();
    expect(screen.getByText(`Stage 3 · ${stages[2].label}`)).toBeDefined();
    expect(screen.queryByText(`Stage 4 · ${stages[3].label}`)).toBeNull();
  });

  test("titles come from the document, so a renamed question renames its link", () => {
    withDocument('<h2 id="s21">21. A brand new title</h2><p>x</p>');
    atRoute("/frontend");
    render(<FrontendDesignPage />);
    expect(qaLinks().map((link) => link.textContent)).toEqual(["A brand new title"]);
    expect(qaLinks()[0].getAttribute("href")).toBe("/interview-qa?q=s21&topic=Next.js%20%26%20build");
  });

  test("an empty document leaves the deeper section with no stages", () => {
    withDocument("");
    atRoute("/frontend");
    render(<FrontendDesignPage />);
    expect(qaLinks()).toHaveLength(0);
  });

  test("metadata is canonical to /frontend and typed as an article", () => {
    expect(metadata.alternates?.canonical).toBe("/frontend");
    expect(metadata.openGraph).toMatchObject({ type: "article", url: "/frontend" });
    expect(String(metadata.description)).toMatch(/nine stage order/);
  });
});
