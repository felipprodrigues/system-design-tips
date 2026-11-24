import type { Meta, StoryObj } from "@storybook/react-vite";
import { PullQuote } from "./PullQuote";

const meta = {
  title: "Design System/Patterns/PullQuote",
  component: PullQuote,
  args: {
    children:
      "“Both of my humans feed me dinner. The weekend they stopped comparing notes, I got fed twice a night.”",
  },
} satisfies Meta<typeof PullQuote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Toned: Story = { args: { tone: "accent" } };
