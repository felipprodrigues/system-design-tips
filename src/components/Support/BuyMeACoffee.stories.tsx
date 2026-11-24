import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import BuyMeACoffee from "./BuyMeACoffee";

const meta = {
  title: "Components/BuyMeACoffee",
  component: BuyMeACoffee,
} satisfies Meta<typeof BuyMeACoffee>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("dialog")!;
    await expect(dialog.open).toBe(false);

    await userEvent.click(canvas.getByRole("button", { name: "Buy me a coffee" }));
    await expect(dialog.open).toBe(true);
    await expect(within(dialog).getByRole("link", { name: /Buy me a coffee/ })).toHaveAttribute(
      "href",
      "https://buymeacoffee.com/devrodrigus",
    );

    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await expect(dialog.open).toBe(false);
  },
};
