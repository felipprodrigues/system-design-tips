import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComparisonCard } from "../ComparisonCard/ComparisonCard";
import { Versus } from "./Versus";

const meta = {
  title: "Design System/Patterns/Versus",
  component: Versus,
  args: {
    left: <ComparisonCard label="REST" tone="amber" points={["Fixed response shapes", "One round trip per resource"]} />,
    right: <ComparisonCard label="GraphQL" tone="teal" points={["Client picks the shape", "One round trip per screen"]} />,
  },
} satisfies Meta<typeof Versus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
