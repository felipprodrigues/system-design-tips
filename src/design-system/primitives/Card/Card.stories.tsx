import type { Meta, StoryObj } from "@storybook/react-vite";
import { TONES } from "../../tone";
import { Text } from "../Text/Text";
import { Card } from "./Card";

const meta = {
  title: "Design System/Primitives/Card",
  component: Card,
  args: { variant: "card", title: "Statelessness" },
  argTypes: {
    variant: { control: "inline-radio", options: ["card", "panel"] },
    tone: { control: "select", options: [undefined, ...TONES] },
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <Card {...args}>
        <Text variant={args.variant === "panel" ? "xs" : "sm-tight"}>
          No request-specific data is kept in a server&rsquo;s memory between requests, so any server can handle any
          request.
        </Text>
      </Card>
    </div>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const KeyTerm: Story = { args: { tone: "teal" } };

export const Panel: Story = { args: { variant: "panel", title: "Throughput Saturation" } };

export const PanelToned: Story = { args: { variant: "panel", tone: "accent", title: "Economic Efficiency Declines" } };
