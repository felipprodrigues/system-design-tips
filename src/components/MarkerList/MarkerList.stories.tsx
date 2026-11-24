import type { Meta, StoryObj } from "@storybook/react-vite";
import { hl } from "@/lib/highlight";
import MarkerList from "./MarkerList";

const meta = {
  title: "Components/MarkerList",
  component: MarkerList,
  args: {
    mark: "▸",
    color: "var(--sd-accent)",
    items: [
      "A system built for a thousand users doesn't automatically handle a million.",
      "The two ways to add capacity have very different costs, limits, and failure characteristics.",
    ],
  },
} satisfies Meta<typeof MarkerList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhyThisExists: Story = {};

export const SeenInTheWild: Story = {
  args: {
    mark: "▪",
    color: "var(--sd-teal)",
    columns: 2,
    items: [
      "Stack Overflow ran on a few powerful, vertically scaled servers for years.",
      "Netflix runs thousands of stateless instances behind load balancers.",
      "AWS RDS offers both resizing and read replicas.",
      "Kubernetes' Horizontal Pod Autoscaler adds instances on CPU or custom metrics.",
    ],
  },
};

export const CommonMistakes: Story = {
  args: {
    mark: "✕",
    color: "var(--sd-danger)",
    bg: "var(--sd-danger-wash)",
    items: ["Assuming horizontal scaling is always the right answer.", "Adding servers before removing local state."],
  },
};

export const KeyPointsWithHighlight: Story = {
  args: {
    mark: "✓",
    color: "var(--sd-green)",
    items: [
      "*The order is the point.* Each step produces the input the next one consumes.",
      "*Estimates only need an order of magnitude.* 200 rps and 200,000 are different systems.",
    ].map(hl),
  },
};
