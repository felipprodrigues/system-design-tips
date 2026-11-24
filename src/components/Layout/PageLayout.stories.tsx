import type { Meta, StoryObj } from "@storybook/react-vite";
import PageLayout from "./PageLayout";

const meta = {
  title: "Components/Layout/PageLayout",
  component: PageLayout,
  parameters: { layout: "fullscreen" },
  args: {
    children: (
      <>
        <h1 className="sd-h1">A 7-Step Walkthrough for Any System Design</h1>
        <p className="sd-lede">The single-column measure used by the walkthrough, Frontend 101 and LinkedIn pages.</p>
        <div className="sd-prose">The column is capped at --sd-page-max and padded by the page tokens.</div>
      </>
    ),
  },
} satisfies Meta<typeof PageLayout>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
