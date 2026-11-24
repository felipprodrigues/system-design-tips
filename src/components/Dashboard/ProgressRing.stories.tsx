import type { Meta, StoryObj } from "@storybook/react-vite";
import ProgressRing from "./ProgressRing";

const meta = {
  title: "Components/ProgressRing",
  component: ProgressRing,
  args: { percent: 35, label: "35%" },
  argTypes: { percent: { control: { type: "range", min: 0, max: 100 } } },
} satisfies Meta<typeof ProgressRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { percent: 0, label: "0%" } };

export const Complete: Story = { args: { percent: 100, label: "100%" } };

export const Large: Story = { args: { size: 120, percent: 62, label: "62%" } };
