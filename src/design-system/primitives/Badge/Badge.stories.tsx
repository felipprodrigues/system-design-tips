import type { Meta, StoryObj } from "@storybook/react-vite";
import { TONES } from "../../tone";
import { Badge } from "./Badge";

const meta = {
  title: "Design System/Primitives/Badge",
  component: Badge,
  args: { variant: "tag", children: "Horizontal", tone: "teal" },
  argTypes: {
    variant: { control: "inline-radio", options: ["tag", "outline", "pill"] },
    tone: { control: "select", options: [undefined, ...TONES] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tag: Story = {};

export const Outline: Story = { args: { variant: "outline", tone: undefined, children: "Postmortem" } };

export const StatusPills: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Badge variant="pill" tone="done">
        Completed
      </Badge>
      <Badge variant="pill" tone="accent">
        In progress
      </Badge>
      <Badge variant="pill" tone="pink">
        Frontend
      </Badge>
    </div>
  ),
};

export const TagTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {TONES.map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
    </div>
  ),
};
