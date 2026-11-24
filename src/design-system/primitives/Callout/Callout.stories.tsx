import type { Meta, StoryObj } from "@storybook/react-vite";
import { TONES } from "../../tone";
import { Strong } from "../Text/Text";
import { Callout, PanelNote } from "./Callout";

const meta = {
  title: "Design System/Primitives/Callout",
  component: Callout,
  args: {
    tone: "accent",
    children: (
      <>
        The three app servers are <Strong>interchangeable</Strong>, which is the whole point.
      </>
    ),
  },
  argTypes: { tone: { control: "select", options: ["neutral", ...TONES] } },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accent: Story = {};

export const Neutral: Story = {
  args: { tone: "neutral", children: "Databases are usually the hardest part of a system to scale horizontally." },
};

export const Green: Story = { args: { tone: "green" } };

export const AnyTone: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 10 }}>
      {(["neutral", "accent", "green", "teal", "danger", "warm", "violet", "done"] as const).map((tone) => (
        <Callout key={tone} tone={tone}>
          tone=&quot;{tone}&quot;: neutral, accent and green render the legacy .sd-callout classes; every other tone
          mixes a 7% tint from its token.
        </Callout>
      ))}
    </div>
  ),
};

export const PanelNotes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
      <PanelNote>
        Start vertical for simplicity. Begin the shift <Strong>before</Strong> you hit the ceiling.
      </PanelNote>
      <PanelNote tone="green">
        <Strong>Optimize before you distribute.</Strong> Profile hot paths first.
      </PanelNote>
      <PanelNote tone="red">Without these strategies prepared, hitting the ceiling is an emergency.</PanelNote>
    </div>
  ),
};
