import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import LearnedToggle from "./LearnedToggle";

const meta = {
  title: "Features/LearnedToggle",
  component: LearnedToggle,
  parameters: { nextjs: { navigation: { pathname: "/concepts/load-balancing" } } },
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <LearnedToggle />
      <p className="sd-lede">Floats onto the lede line of any concept or listed page.</p>
    </div>
  ),
} satisfies Meta<typeof LearnedToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotCompleted: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Complete" })).toHaveAttribute("aria-pressed", "false");
    await expect(JSON.parse(localStorage.getItem("sd-visited") ?? "[]")).toContain("load-balancing");
  },
};

export const MarkingComplete: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Complete" }));
    await expect(within(canvasElement).getByRole("button", { name: /Completed/ })).toHaveAttribute("aria-pressed", "true");
    await expect(JSON.parse(localStorage.getItem("sd-completed") ?? "[]")).toContain("load-balancing");
  },
};

export const Completed: Story = {
  parameters: { localStorage: { "sd-completed": ["load-balancing"] } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: /Completed/ })).toHaveAttribute("aria-pressed", "true");
  },
};

export const OnAnUntrackedPage: Story = {
  parameters: { nextjs: { navigation: { pathname: "/about" } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button")).toBeNull();
  },
};
