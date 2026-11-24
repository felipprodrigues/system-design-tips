import type { Meta, StoryObj } from "@storybook/react-vite";
import { Highlight, Strong, Text } from "./Text";

const meta = {
  title: "Design System/Primitives/Text",
  component: Text,
  args: {
    variant: "sm",
    children: "A session stored in one server's memory only exists on that server.",
  },
  argTypes: { variant: { control: "inline-radio", options: ["lede", "sm", "sm-tight", "xs"] } },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {};

export const Lede: Story = {
  args: { variant: "lede", children: "Understanding how systems grow, and the trade-offs each approach demands." },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 14 }}>
      <Text variant="lede">lede · Understanding how systems grow.</Text>
      <Text variant="sm">sm · Vertical scaling hits a ceiling defined by physical hardware.</Text>
      <Text variant="sm-tight">sm-tight · The default inside cards and marker lists.</Text>
      <Text variant="xs">xs · Panel card bodies and figure footnotes.</Text>
    </div>
  ),
};

export const Emphasis: Story = {
  render: () => (
    <Text>
      Start vertical. Once you are within <Strong>60–70% of maximum capacity</Strong>, begin the shift to{" "}
      <Highlight>horizontal</Highlight>, keep <Highlight tone="accent">state external</Highlight>, watch the{" "}
      <Highlight tone="amber">primary database</Highlight>, and ignore the <Highlight tone="muted">noise</Highlight>.
    </Text>
  ),
};
