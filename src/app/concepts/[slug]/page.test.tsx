import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { reading } from "@/lib/concepts";
import { SITE_NAME } from "@/lib/seo";
import { atRoute } from "@/test/appTestUtils";
import ConceptPage, { dynamicParams, generateMetadata, generateStaticParams } from "./page";

const props = (slug: string) => ({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({}) });
const first = reading[0].concept;
const last = reading.at(-1)!.concept;

async function renderConcept(slug: string) {
  atRoute(`/concepts/${slug}`);
  render(await ConceptPage(props(slug)));
}

describe("static generation", () => {
  test("every concept in the reading order gets a page, once", () => {
    const slugs = generateStaticParams().map(({ slug }) => slug);
    expect(slugs).toEqual(expect.arrayContaining(reading.map(({ concept }) => concept.slug)));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toHaveLength(reading.length);
  });

  test("an unlisted slug 404s instead of reaching the import", () => {
    expect(dynamicParams).toBe(false);
  });
});

describe("metadata", () => {
  test("each concept is titled and canonical to its own path", async () => {
    const meta = await generateMetadata(props(last.slug));
    expect(meta.title).toBe(last.title);
    expect(meta.description).toBe(last.description);
    expect(meta.alternates?.canonical).toBe(`/concepts/${last.slug}`);
    expect(meta.openGraph).toMatchObject({ type: "article", title: `${last.title} · ${SITE_NAME}` });
  });

  test("an unknown slug is an error, not empty metadata", async () => {
    await expect(generateMetadata(props("not-a-concept"))).rejects.toThrow("Unknown concept slug: not-a-concept");
  });
});

describe("page", () => {
  test("the chrome wraps the body: breadcrumb, heading, rail and footer nav", async () => {
    const middle = reading[Math.floor(reading.length / 2)];
    await renderConcept(middle.concept.slug);
    expect(screen.getByRole("link", { name: middle.group.title })).toBeDefined();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(middle.concept.title);
    expect(screen.getByRole("complementary", { name: "Related reading" })).toBeDefined();
    expect(screen.getByRole("link", { name: /Previous/ })).toBeDefined();
    expect(screen.getByRole("link", { name: /Next/ })).toBeDefined();
  });

  test("the first concept has no previous page and carries its label in the footer", async () => {
    await renderConcept(first.slug);
    expect((screen.getByRole("button", { name: /Previous/ }) as HTMLButtonElement).disabled).toBe(true);
    if (first.label) expect(screen.getAllByText(first.label).length).toBeGreaterThan(0);
  });

  test("the last concept has no next page", async () => {
    await renderConcept(last.slug);
    expect(screen.queryByRole("link", { name: /Next/ })).toBeNull();
  });

  test("prev and next follow the reading order across group boundaries", async () => {
    const boundary = reading.findIndex((entry, i) => i > 0 && entry.group !== reading[i - 1].group);
    await renderConcept(reading[boundary].concept.slug);
    expect(screen.getByRole("link", { name: /Previous/ }).getAttribute("href")).toBe(
      `/concepts/${reading[boundary - 1].concept.slug}`,
    );
  });

  test("an unknown slug rejects rather than rendering an empty page", async () => {
    await expect(ConceptPage(props("not-a-concept"))).rejects.toThrow();
  });
});
