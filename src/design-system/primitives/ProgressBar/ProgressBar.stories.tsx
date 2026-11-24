import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Design System/Primitives/ProgressBar",
  component: ProgressBar,
  args: { value: 60 },
  argTypes: { value: { control: { type: "range", min: 0, max: 100 } } },
  render: (args) => (
    <div style={{ display: "flex", width: 320 }}>
      <ProgressBar {...args} />
    </div>
  ),
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Decorative: Story = {};

export const Labelled: Story = {
  args: { value: 140, label: "Scaling and Trade-offs progress", tone: "accent" },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar", { name: "Scaling and Trade-offs progress" });
    await expect(bar).toHaveAttribute("aria-valuenow", "100");
  },
};
