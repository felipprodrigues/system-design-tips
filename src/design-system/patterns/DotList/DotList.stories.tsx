import type { Meta, StoryObj } from "@storybook/react-vite";
import { DotList } from "./DotList";

const meta = {
  title: "Design System/Patterns/DotList",
  component: DotList,
  args: {
    tone: "teal",
    items: [
      "The edge fetches from origin on the first miss.",
      "Every later request in that region is served locally.",
      "Nothing is uploaded ahead of demand.",
    ],
  },
} satisfies Meta<typeof DotList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
