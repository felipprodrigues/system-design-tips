import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import html from "@/content/interview-qa.html?raw";
import { parseSections } from "@/lib/interviewPrep";
import PrepBrowser from "./PrepBrowser";

const sections = parseSections(html);

const meta = {
  title: "Features/PrepBrowser",
  component: PrepBrowser,
  args: { sections },
} satisfies Meta<typeof PrepBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("navigation", { name: "All questions by topic" })).toBeInTheDocument();
  },
};

export const EmptySavedFilter: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Saved/ }));
    await expect(canvas.getByText(/Nothing saved yet/)).toBeInTheDocument();
  },
};

export const WithSavedQuestions: Story = {
  parameters: { localStorage: { "sd-saved": sections.slice(0, 3).map((section) => section.id) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: /Saved 3/ })).toBeInTheDocument();
  },
};
