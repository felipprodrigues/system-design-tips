import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { caseStudies } from "@/lib/caseStudies";
import CaseStudyBrowser from "./CaseStudyBrowser";

const meta = {
  title: "Features/CaseStudyBrowser",
  component: CaseStudyBrowser,
} satisfies Meta<typeof CaseStudyBrowser>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("article")).toHaveLength(caseStudies.length);
  },
};

export const FilteringByTheme: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const caching = within(canvas.getByRole("group", { name: "Filter by theme" })).getByRole("button", { name: /^Caching/ });
    await userEvent.click(caching);
    await expect(caching).toHaveAttribute("aria-pressed", "true");

    const expected = caseStudies.filter((study) => study.themes.includes("Caching")).length;
    await expect(canvas.getAllByRole("article")).toHaveLength(expected);
    await expect(canvas.getByText(new RegExp(`${expected} case stud(y|ies) in Caching`))).toBeInTheDocument();
  },
};
