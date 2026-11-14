import type { Meta, StoryObj } from "@storybook/react-vite";
import DeepDiveButton from "./DeepDiveButton";

const meta = {
  component: DeepDiveButton,
  args: { onClick: () => {} },
} satisfies Meta<typeof DeepDiveButton>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const CustomLabel: StoryObj<typeof meta> = {
  args: { label: "Read the breakdown" },
};
