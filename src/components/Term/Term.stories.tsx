import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import Term from "./Term";

const meta = {
  title: "Components/Term",
  component: Term,
  args: {
    label: "hydration",
    children: "React attaching event handlers to HTML the server already rendered, so the page becomes interactive.",
  },
  render: (args) => (
    <p className="sd-text-sm" style={{ marginTop: 200, maxWidth: 520 }}>
      The page is visible before <Term {...args} /> finishes, which is why a fast first paint can still feel stuck.
    </p>
  ),
} satisfies Meta<typeof Term>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Definition: Story = {
  play: async ({ canvasElement }) => {
    const term = within(canvasElement).getByText("hydration", { selector: ".sd-term" });
    await expect(term).toHaveAttribute("tabindex", "0");
    await expect(within(term).getByRole("tooltip", { hidden: true })).toBeInTheDocument();
  },
};

export const LinksToAPage: Story = {
  args: { label: "CDN", href: "/concepts/content-delivery-networks", children: "Edge servers close to the reader." },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: /CDN/ });
    await expect(link).toHaveAttribute("href", "/concepts/content-delivery-networks");
    await expect(link).toHaveTextContent("Open the page →");
  },
};
