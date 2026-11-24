import type { Meta, StoryObj } from "@storybook/react-vite";
import { Strong } from "../Text/Text";
import { Prose } from "./Prose";

const meta = {
  title: "Design System/Primitives/Prose",
  component: Prose,
  args: { size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["md", "lg"] } },
  render: (args) => (
    <Prose {...args}>
      <p>
        Imagine a single cashier who gets faster and faster at ringing people up: that is{" "}
        <Strong>vertical scaling</Strong>. Now open three more registers: that is <Strong>horizontal scaling</Strong>.
      </p>
      <p>
        Opening more registers only works if any cashier can help any customer. Consecutive paragraphs are
        spaced by the component, not by an inline margin on each one.
      </p>
    </Prose>
  ),
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BigIdea: Story = { args: { size: "lg" } };
