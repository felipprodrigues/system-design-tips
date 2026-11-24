import type { Meta, StoryObj } from "@storybook/react-vite";
import Hero from "./Hero";

const meta = {
  title: "Components/Layout/Hero",
  component: Hero,
  args: {
    eyebrow: "Case Studies",
    title: "System blueprints",
    children:
      "The same trade-offs the concepts cover, met by real teams at real scale. Postmortems where it went wrong, write-ups where it went right.",
  },
} satisfies Meta<typeof Hero>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
