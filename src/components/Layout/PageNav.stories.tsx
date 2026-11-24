import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import PageNav from "./PageNav";

const meta = {
  title: "Components/Layout/PageNav",
  component: PageNav,
  parameters: { layout: "fullscreen" },
  args: {
    conceptNumber: 3,
    totalConcepts: 7,
    sectionTitle: "Scaling and Trade-offs",
    prevHref: "/concepts/latency-throughput-availability",
    nextHref: "/concepts/load-balancing",
  },
} satisfies Meta<typeof PageNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Middle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: /Previous/ })).toHaveAttribute("href", "/concepts/latency-throughput-availability");
    await expect(canvas.getByRole("link", { name: /Next/ })).toHaveAttribute("href", "/concepts/load-balancing");
  },
};

export const First: Story = {
  args: { conceptNumber: 1, prevHref: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: /Previous/ })).toBeDisabled();
  },
};

export const LastWithLabel: Story = {
  args: { nextHref: undefined, label: "Prologue", sectionTitle: "Fundamentals" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Prologue")).toBeInTheDocument();
    await expect(canvas.queryByRole("link", { name: /Next/ })).toBeNull();
  },
};
