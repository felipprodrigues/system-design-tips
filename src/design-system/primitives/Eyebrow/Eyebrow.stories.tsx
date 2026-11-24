import type { Meta, StoryObj } from "@storybook/react-vite";
import { TONES } from "../../tone";
import { Eyebrow } from "./Eyebrow";

const meta = {
  title: "Design System/Primitives/Eyebrow",
  component: Eyebrow,
  args: { children: "Why this exists", variant: "section" },
  argTypes: {
    variant: { control: "inline-radio", options: ["section", "accent", "sub"] },
    tone: { control: "select", options: [undefined, ...TONES] },
  },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Section: Story = {};

export const Accent: Story = { args: { variant: "accent", children: "Quiz Review" } };

export const Sub: Story = { args: { variant: "sub", children: "Asking by position" } };

export const Toned: Story = { args: { variant: "sub", tone: "amber", children: "What I saw" } };

export const AllVariants: Story = {
  render: () => (
    <div>
      <Eyebrow>section · .sd-eyebrow</Eyebrow>
      <Eyebrow variant="accent">accent · .sd-eyebrow-accent</Eyebrow>
      <Eyebrow variant="sub">sub · .sd-eyebrow-sub</Eyebrow>
    </div>
  ),
};
