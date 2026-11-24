import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { SHELVES } from "@/lib/caseStudies";
import CaseStudyBrowser from "./CaseStudyBrowser";

const meta = {
  title: "Features/CaseStudyBrowser",
  component: CaseStudyBrowser,
} satisfies Meta<typeof CaseStudyBrowser>;

export default meta;

const systemsShelf = { nextjs: { navigation: { pathname: "/case-studies", query: { set: "systems" } } } };

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole("article")).toHaveLength(0);
    for (const shelf of Object.values(SHELVES)) {
      await expect(canvas.getByRole("button", { name: new RegExp(shelf.title) })).toBeInTheDocument();
    }
  },
};

export const Shelf: StoryObj<typeof meta> = {
  parameters: systemsShelf,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("article")).toHaveLength(SHELVES.systems.studies.length);
  },
};

export const FilteringByTheme: StoryObj<typeof meta> = {
  parameters: systemsShelf,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const caching = within(canvas.getByRole("group", { name: "Filter by theme" })).getByRole("button", { name: /^Caching/ });
    await userEvent.click(caching);
    await expect(caching).toHaveAttribute("aria-pressed", "true");

    const expected = SHELVES.systems.studies.filter((study) => study.themes.includes("Caching")).length;
    await expect(canvas.getAllByRole("article")).toHaveLength(expected);
    await expect(canvas.getByText(new RegExp(`${expected} case stud(y|ies) in Caching`))).toBeInTheDocument();
  },
};
