import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DataTable } from "./DataTable";

const meta = {
  title: "Design System/Primitives/DataTable",
  component: DataTable,
  args: {
    caption: "Vertical versus horizontal scaling",
    columns: [
      { header: "Feature", tone: "muted", emphasis: true },
      { header: "Vertical", tone: "amber" },
      { header: "Horizontal", tone: "teal" },
    ],
    rows: [
      ["Complexity", "Low — single node", "High — distributed coordination"],
      ["Availability", "Low — single point of failure", "High — redundancy by design"],
      ["Cost", "Expensive at high tiers", "Cost-effective (commodity hardware)"],
      ["Growth Limit", "Physical hardware ceiling", "Theoretically unlimited"],
    ],
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Comfortable: Story = {
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole("table", { name: "Vertical versus horizontal scaling" });
    await expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    await expect(within(table).getAllByRole("row")).toHaveLength(5);
  },
};

export const Compact: Story = {
  args: {
    density: "compact",
    caption: "Consistency models",
    columns: [
      { header: "Model", emphasis: true },
      { header: "Under partition", tone: "muted" },
      { header: "Normal latency", tone: "muted" },
      { header: "Common use case" },
    ],
    rows: [
      ["Linearizable", "Rejects reads and writes", "Highest — multi-node round trips", "Financial ledgers, seat booking"],
      ["Causal", "Stays available", "Low — asynchronous propagation", "Comment threads, collaborative editing"],
      ["Eventual", "Stays available", "Lowest — local read and write", "Social feeds, analytics counters, DNS"],
    ],
  },
};

export const MonoLeadColumn: Story = {
  args: {
    caption: "What each step hands the next",
    columns: [
      { header: "", tone: "teal", mono: true, nowrap: true },
      { header: "What moves forward" },
      { header: "What it unblocks", tone: "muted" },
    ],
    rows: [
      ["1 → 2", "Feature list and scale targets", "There is something to count"],
      ["2 → 3", "Requests per second, storage growth", "You know whether one box or a fleet"],
      ["3 → 4", "Which components read and write data", "The access patterns are visible"],
    ],
  },
};
