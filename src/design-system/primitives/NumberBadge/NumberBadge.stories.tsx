import type { Meta, StoryObj } from "@storybook/react-vite";
import { TONES } from "../../tone";
import { NumberBadge } from "./NumberBadge";

const meta = {
  title: "Design System/Primitives/NumberBadge",
  component: NumberBadge,
  args: { children: "1", size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg"] },
    tone: { control: "select", options: [undefined, ...TONES] },
  },
} satisfies Meta<typeof NumberBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <NumberBadge size="xs" mono={false} tone="green">
        +
      </NumberBadge>
      <NumberBadge size="sm">2</NumberBadge>
      <NumberBadge size="md">3</NumberBadge>
      <NumberBadge size="lg" mono={false}>
        A
      </NumberBadge>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      {TONES.map((tone, i) => (
        <NumberBadge key={tone} tone={tone} title={tone}>
          {i + 1}
        </NumberBadge>
      ))}
    </div>
  ),
};
