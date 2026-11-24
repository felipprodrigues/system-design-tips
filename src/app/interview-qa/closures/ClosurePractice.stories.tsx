import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { EXERCISE } from "../set/exercise";
import ClosurePractice from "./ClosurePractice";

const meta = {
  title: "Features/ClosurePractice",
  component: ClosurePractice,
  args: { exercise: EXERCISE },
} satisfies Meta<typeof ClosurePractice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Board: Story = {};

export const RefHighlightsItsBox: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Show the walkthrough (spoilers)"));
    for (let i = 0; i < 4; i++) await userEvent.click(await canvas.findByRole("button", { name: "Next →" }));

    await userEvent.hover(canvas.getByRole("button", { name: "#2" }));
    await expect(canvasElement.querySelector('[data-box="#2 object"]')?.className).toMatch(/hot/);
    await expect(canvasElement.querySelector('[data-box="#1 object"]')?.className).not.toMatch(/hot/);
  },
};
