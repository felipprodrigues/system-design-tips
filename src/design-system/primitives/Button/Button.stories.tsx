import Link from "next/link";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TONES } from "../../tone";
import { Button, buttonStyles } from "./Button";

const meta = {
  title: "Design System/Primitives/Button",
  component: Button,
  args: { children: "Resume", variant: "secondary", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["ghost", "secondary", "pill", "tinted"] },
    tone: { control: "select", options: [undefined, ...TONES] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Resume" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Ghost: Story = { args: { variant: "ghost", children: "← Previous" } };

export const Pill: Story = { args: { variant: "pill", children: "Next →" } };

export const Tinted: Story = { args: { variant: "tinted", tone: "teal", children: "Check it out" } };

export const Disabled: Story = {
  args: { variant: "ghost", disabled: true, children: "← Prev" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "← Prev" });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Button {...args} variant="ghost">
        ghost
      </Button>
      <Button {...args} variant="secondary">
        secondary
      </Button>
      <Button {...args} variant="pill">
        pill
      </Button>
      <Button {...args} variant="tinted" tone="teal">
        tinted
      </Button>
    </div>
  ),
};

export const LinkWithButtonStyles: Story = {
  render: () => (
    <Link href="/concepts/load-balancing" {...buttonStyles({ variant: "secondary" })}>
      Open next
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Open next" });
    await expect(link).toHaveAttribute("data-variant", "secondary");
  },
};
