import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import PanelSection from "./PanelSection";

const meta = {
  title: "Components/PanelSection",
  component: PanelSection,
  args: {
    title: "Scaling vs. optimization",
    children: (
      <>
        <p className="sd-text-sm">Horizontal scaling does not fix inefficient algorithms; it masks them.</p>
        <div className="sd-panel-note">Optimize before you distribute.</div>
      </>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 420, background: "var(--sd-surface)", padding: 20 }}>
      <PanelSection {...args} />
    </div>
  ),
} satisfies Meta<typeof PanelSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const head = canvas.getByRole("button", { name: /Scaling vs. optimization/ });
    const section = head.parentElement!;
    await expect(section.className).not.toMatch(/open/);
    await userEvent.click(head);
    await expect(section.className).toMatch(/open/);
  },
};

export const DefaultOpen: Story = { args: { defaultOpen: true } };
