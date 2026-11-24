import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberedItem } from "./NumberedItem";

const meta = {
  title: "Design System/Patterns/NumberedItem",
  component: NumberedItem,
  args: {
    num: "1",
    title: "Economic Efficiency Declines",
    children: "Top-tier hardware often costs more than running multiple commodity instances.",
  },
  render: (args) => (
    <div style={{ maxWidth: 380 }}>
      <NumberedItem {...args} />
    </div>
  ),
} satisfies Meta<typeof NumberedItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InAPanel: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, maxWidth: 380 }}>
      {[
        { num: "A", title: "Functional Decomposition", tone: "teal" as const },
        { num: "B", title: "Data Partitioning (Sharding)", tone: "teal" as const },
        { num: "C", title: "Read/Write Splitting & Caching", tone: "teal" as const },
      ].map((item) => (
        <NumberedItem key={item.num} num={item.num} title={item.title} tone={item.tone}>
          One bottleneck becomes an aggregate of nodes that scale linearly.
        </NumberedItem>
      ))}
    </div>
  ),
};
