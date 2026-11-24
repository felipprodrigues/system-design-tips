import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { latestRelease } from "@/lib/releases";
import AppShell from "./AppShell";
import NewContentToast from "./NewContentToast";
import TopTabs from "./TopTabs";

const announced = { [`sd-announced:${latestRelease.href}`]: "1" };

const meta = {
  title: "Features/App Shell",
  component: AppShell,
  parameters: { layout: "fullscreen", localStorage: announced, nextjs: { navigation: { pathname: "/" } } },
  args: {
    children: (
      <div style={{ padding: "34px 28px" }}>
        <p className="sd-text-sm">Page content renders here.</p>
      </div>
    ),
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Frame: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Roadmap" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  },
};

export const TabOwnership: Story = {
  parameters: { nextjs: { navigation: { pathname: "/concepts/cap-theorem" } } },
  render: () => <TopTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Roadmap" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  },
};

export const NewContent: Story = {
  parameters: { localStorage: { [`sd-announced:${latestRelease.href}`]: null } },
  render: () => <NewContentToast />,
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("status")).toHaveTextContent(latestRelease.title);
  },
};

export const DismissingNewContent: Story = {
  parameters: NewContent.parameters,
  render: NewContent.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("status");
    await userEvent.click(canvas.getByRole("button", { name: `Dismiss: ${latestRelease.title}` }));
    await expect(canvas.queryByRole("status")).toBeNull();
    await expect(localStorage.getItem(`sd-announced:${latestRelease.href}`)).toBe("1");
  },
};

export const NotAnnouncedOnItsOwnPage: Story = {
  parameters: { ...NewContent.parameters, nextjs: { navigation: { pathname: latestRelease.href } } },
  render: NewContent.render,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("status")).toBeNull();
  },
};
