import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DefinitionList } from "./DefinitionList";

const meta = {
  title: "Design System/Patterns/DefinitionList",
  component: DefinitionList,
  args: {
    items: [
      { title: "Vertical scaling", def: "Increasing the capacity of a single machine with more CPU, memory, or faster storage." },
      { title: "Horizontal scaling", def: "Adding more machines and distributing load across them, typically via a load balancer." },
      { title: "Elasticity", def: "Automatically adding or removing capacity in response to real-time demand." },
    ],
  },
} satisfies Meta<typeof DefinitionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyTerms: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("term")).toHaveLength(3);
    await expect(canvas.getAllByRole("definition")).toHaveLength(3);
  },
};

export const Toned: Story = { args: { tone: "accent" } };
