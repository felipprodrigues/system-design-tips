import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import DeepDiveButton from "../Button/DeepDiveButton";
import PanelSection from "./PanelSection";
import SidePanel from "./SidePanel";

function Sections() {
  return (
    <>
      <PanelSection title="When to make the switch" defaultOpen>
        <p className="sd-text-sm">Four signals that it is time to go horizontal.</p>
        <div className="sd-panel-note">Start vertical. Begin the shift at 60–70% of capacity.</div>
      </PanelSection>
      <PanelSection title="The state problem">
        <p className="sd-text-sm">Shared state is the primary inhibitor to horizontal scaling.</p>
      </PanelSection>
    </>
  );
}

const meta = {
  title: "Components/SidePanel",
  component: SidePanel,
  parameters: { layout: "fullscreen" },
  args: { open: true, title: "Going further", onClose: fn(), children: <Sections /> },
} satisfies Meta<typeof SidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ args }) => {
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const CustomEyebrow: Story = { args: { eyebrow: "Finding 2" } };

export const OpenedFromDeepDive: Story = {
  render: (args) => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ padding: 24 }}>
          <DeepDiveButton onClick={() => setOpen(true)} />
          <SidePanel {...args} open={open} onClose={() => setOpen(false)} />
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Deep Dive/ }));
    await expect(document.documentElement.style.overflow).toBe("hidden");
    await userEvent.click(canvas.getByRole("button", { name: "✕" }));
    await expect(document.documentElement.style.overflow).toBe("");
  },
};
