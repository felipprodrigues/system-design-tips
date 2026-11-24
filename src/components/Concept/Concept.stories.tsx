import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import ConceptHeader from "./ConceptHeader";
import ConceptRail from "./ConceptRail";

const meta = {
  title: "Features/Concept Chrome",
  component: ConceptRail,
  args: { slug: "load-balancing" },
  argTypes: {
    slug: {
      control: "select",
      options: ["load-balancing", "caching-strategies", "request-lifecycle", "scaling-a-photo-app"],
    },
  },
} satisfies Meta<typeof ConceptRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = {
  render: ({ slug }) => (
    <div style={{ maxWidth: "var(--sd-page-max)" }}>
      <ConceptHeader slug={slug} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 1 })).toHaveTextContent("Load Balancing");
  },
};

export const PrologueHeader: Story = {
  args: { slug: "request-lifecycle" },
  render: Header.render,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Prologue/)).toBeInTheDocument();
  },
};

export const Rail: Story = {
  parameters: { layout: "padded" },
  play: async ({ canvasElement }) => {
    const rail = within(canvasElement).getByRole("complementary", { name: "Related reading" });
    await expect(within(rail).getByRole("heading", { name: "Related concepts" })).toBeInTheDocument();
  },
};
