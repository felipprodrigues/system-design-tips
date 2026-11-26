import type * as Fs from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, test, vi } from "vitest";
import { atRoute } from "@/test/appTestUtils";
import { PRACTICE } from "@/lib/interviewPrep";
import { findings } from "./data";
import PaginatedListSyncPage, { metadata } from "./page";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof Fs>();
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) };
});

const isQaLink = (href: string | null) =>
  !!href && (href.startsWith("/interview-qa?q=") || Object.values(PRACTICE).includes(href));

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

const panel = (n: number) => document.getElementById(`finding-panel-${n}`)!;
const answered = (n: number) =>
  within(panel(n))
    .queryAllByRole("link", { hidden: true })
    .filter((link) => isQaLink(link.getAttribute("href")));

describe("/linkedin-skills route", () => {
  test("every finding's Q&A numbers resolve against the real document", () => {
    atRoute("/linkedin-skills");
    render(<PaginatedListSyncPage />);
    for (const finding of findings) expect(answered(finding.n)).toHaveLength(finding.qa.length);
  });

  test("missing numbers are dropped, and a finding left with none shows no Q&A card", () => {
    const [first] = findings;
    withDocument(`<h2 id="s${first.qa[0]}">${first.qa[0]}. The one that survived</h2><p>x</p>`);
    atRoute("/linkedin-skills");
    render(<PaginatedListSyncPage />);
    for (const finding of findings) {
      const shares = finding.qa.includes(first.qa[0]);
      expect(answered(finding.n).map((link) => link.textContent)).toEqual(shares ? ["The one that survived"] : []);
      expect(within(panel(finding.n)).queryByText("Already answered in the Q&A") !== null).toBe(shares);
    }
    expect(findings.filter((finding) => finding.qa.includes(first.qa[0])).length).toBeGreaterThan(1);
  });

  test("metadata is canonical to /linkedin-skills and typed as an article", () => {
    expect(metadata.alternates?.canonical).toBe("/linkedin-skills");
    expect(metadata.openGraph).toMatchObject({ type: "article", url: "/linkedin-skills" });
  });

  test("the question links are labelled with the document's titles", () => {
    withDocument('<h2 id="s5">5. Renamed upstream</h2><p>x</p>');
    atRoute("/linkedin-skills");
    render(<PaginatedListSyncPage />);
    expect(screen.getAllByText("Renamed upstream").length).toBeGreaterThan(0);
  });
});
