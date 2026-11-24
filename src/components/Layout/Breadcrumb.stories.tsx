import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import Breadcrumb from "./Breadcrumb";

const meta = {
  title: "Components/Layout/Breadcrumb",
  component: Breadcrumb,
  parameters: { layout: "fullscreen" },
  args: { section: "Scaling and Trade-offs", concept: "Scalability: Vertical vs Horizontal Scaling" },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Concept: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Scaling and Trade-offs" });
    await expect(link).toHaveAttribute("href", "/");
  },
};

export const CustomSectionHref: Story = {
  args: { section: "The Method", sectionHref: "/walkthrough", concept: "A 7-Step Walkthrough for Any System Design" },
};
