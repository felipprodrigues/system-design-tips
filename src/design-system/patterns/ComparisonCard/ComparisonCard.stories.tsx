import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eyebrow } from "../../primitives/Eyebrow/Eyebrow";
import { Text } from "../../primitives/Text/Text";
import { ComparisonCard } from "./ComparisonCard";

const meta = {
  title: "Design System/Patterns/ComparisonCard",
  component: ComparisonCard,
  args: {
    label: "Origin pull",
    tone: "amber",
    points: ["The edge fetches from origin on the first miss.", "Nothing is uploaded ahead of demand."],
  },
  render: (args) => (
    <div style={{ maxWidth: 380 }}>
      <ComparisonCard {...args} />
    </div>
  ),
} satisfies Meta<typeof ComparisonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: {
    label: "Origin push",
    tone: "teal",
    footer: (
      <>
        <Eyebrow variant="sub">One file, 40 edge regions</Eyebrow>
        <Text variant="xs">Forty uploads before the first reader, whether anyone reads it or not.</Text>
      </>
    ),
  },
};
