import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import ThemeToggle from "./ThemeToggle";

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const root = document.documentElement;
    const before = root.getAttribute("data-theme");
    const button = within(canvasElement).getByRole("button", { name: "Toggle theme" });

    await userEvent.click(button);
    await expect(root.getAttribute("data-theme")).not.toBe(before);
    await expect(localStorage.getItem("sd-theme")).toBe(root.getAttribute("data-theme"));

    await userEvent.click(button);
    await expect(root.getAttribute("data-theme")).toBe(before);
  },
};
