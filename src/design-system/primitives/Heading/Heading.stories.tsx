import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";

const meta = {
  title: "Design System/Primitives/Heading",
  component: Heading,
  args: { children: "Stateless Servers Behind A Load Balancer", level: "section" },
  argTypes: { level: { control: "inline-radio", options: ["page", "section"] } },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = { args: { level: "page", children: "Scalability: Vertical vs Horizontal Scaling" } };

export const SectionTitle: Story = {};

export const SectionStyleAsH3: Story = {
  args: { as: "h3", children: "Finding 2: the filtered view that kept a deleted row" },
};
