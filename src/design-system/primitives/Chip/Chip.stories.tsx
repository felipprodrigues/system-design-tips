import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Chip, ChipGroup } from "./Chip";

const THEMES = [
  { name: "All", count: 24 },
  { name: "Caching", count: 6 },
  { name: "Databases", count: 8 },
  { name: "Reliability", count: 10 },
];

function FilterChips() {
  const [active, setActive] = useState("All");
  return (
    <ChipGroup label="Filter by theme">
      {THEMES.map((theme) => (
        <Chip
          key={theme.name}
          pressed={active === theme.name}
          count={theme.count}
          onClick={() => setActive(theme.name)}
        >
          {theme.name}
        </Chip>
      ))}
    </ChipGroup>
  );
}

const meta = {
  title: "Design System/Primitives/Chip",
  component: Chip,
  args: { children: "Caching", count: 6, pressed: false, onClick: fn() },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pressed: Story = { args: { pressed: true } };

export const Toned: Story = { args: { pressed: true, tone: "warm", children: "★ Saved", count: 3 } };

export const FilterGroup: Story = {
  render: () => <FilterChips />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Filter by theme" });
    const all = within(group).getByRole("button", { name: /All/ });
    const caching = within(group).getByRole("button", { name: /Caching/ });

    await expect(all).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(caching);
    await expect(caching).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
  },
};
