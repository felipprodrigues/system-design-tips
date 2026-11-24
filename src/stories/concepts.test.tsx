import { readdirSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { bySlug } from "@/lib/concepts";
import { CONCEPT_SLUGS, ConceptPage, loadConcept } from "./pageFixtures";

/* relational-vs-nosql uses <style jsx>, which Next compiles and Vite cannot, so React
   warns about a raw `jsx` attribute. That warning alone is a build difference. */
const STYLED_JSX = /non-boolean attribute[\s\S]*\bjsx\b/;

let errors: string[] = [];
beforeEach(() => {
  errors = [];
  vi.spyOn(console, "error").mockImplementation((...args) => {
    const message = args.map(String).join(" ");
    if (!STYLED_JSX.test(message)) errors.push(message);
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

test("every concept body on disk is listed in the concept index, and the reverse", () => {
  const onDisk = readdirSync(join(process.cwd(), "src/concepts"))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => file.replace(/\.tsx$/, ""))
    .sort();
  expect(onDisk).toEqual([...CONCEPT_SLUGS].sort());
});

describe("concept pages render inside the route chrome", () => {
  for (const slug of CONCEPT_SLUGS) {
    test(slug, async () => {
      const Body = await loadConcept(slug);
      const { container } = render(<ConceptPage slug={slug} Body={Body} />);

      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(bySlug.get(slug)!.concept.title);
      expect(container.querySelector(".sd-quiz")).not.toBeNull();
      expect(errors).toEqual([]);
    });
  }
});
