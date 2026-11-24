import type { Meta, StoryObj } from "@storybook/react-vite";
import MarkerList from "@/components/MarkerList/MarkerList";
import { Prose } from "../../primitives/Prose/Prose";
import { Strong } from "../../primitives/Text/Text";
import { Section } from "./Section";

const meta = {
  title: "Design System/Patterns/Section",
  component: Section,
  args: { eyebrow: "Why This Exists", title: "Why Capacity Is A Design Decision" },
  render: (args) => (
    <Section {...args}>
      <MarkerList
        mark="▸"
        color="var(--sd-accent)"
        items={[
          "A system built for a thousand users doesn't automatically handle a million.",
          "A bigger machine or more machines: very different costs, limits and failure characteristics.",
        ]}
      />
    </Section>
  ),
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTitle: Story = {};

export const BigIdea: Story = {
  args: { eyebrow: "Big Idea", title: undefined },
  render: (args) => (
    <Section {...args}>
      <Prose size="lg">
        <p>
          There are only two ways to serve more load: give one machine more power (<Strong>vertical scaling</Strong>),
          or give the work to more machines (<Strong>horizontal scaling</Strong>).
        </p>
      </Prose>
    </Section>
  ),
};
