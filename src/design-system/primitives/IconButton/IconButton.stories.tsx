import type { Meta, StoryObj } from "@storybook/react-vite";
import { Moon } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { IconButton } from "./IconButton";

const meta = {
  title: "Design System/Primitives/IconButton",
  component: IconButton,
  args: { label: "Close", children: "✕", variant: "soft", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["soft", "outline", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Soft: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Close" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Outline: Story = { args: { variant: "outline" } };

export const GhostSmall: Story = { args: { variant: "ghost", size: "sm", label: "Dismiss" } };

export const WithIcon: Story = { args: { label: "Toggle theme", children: <Moon size={15} /> } };
