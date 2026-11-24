import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { deriveRoadmap } from "@/lib/roadmap";
import ConceptCard from "./ConceptCard";
import Dashboard from "./Dashboard";
import SectionCard from "./SectionCard";

const fresh = deriveRoadmap([], []);
const started = deriveRoadmap(["horizontal-vs-vertical-scaling"], ["horizontal-vs-vertical-scaling", "cap-theorem"]);
const scaling = started.sections.find((section) => section.title === "Scaling and Trade-offs")!;

const meta = {
  title: "Features/Roadmap",
  component: Dashboard,
  args: { questionCount: 67 },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstVisit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Roadmap" })).toBeInTheDocument();
    await expect(canvas.getByText("Start with")).toBeInTheDocument();
    await expect(canvas.getByText("Nothing yet")).toBeInTheDocument();
  },
};

export const InProgress: Story = {
  parameters: {
    localStorage: {
      "sd-completed": ["request-lifecycle", "horizontal-vs-vertical-scaling"],
      "sd-visited": ["request-lifecycle", "horizontal-vs-vertical-scaling", "cap-theorem"],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Continue")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /CAP Theorem.*In progress/ })).toBeInTheDocument();
  },
};

export const SectionStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 10, maxWidth: 1120 }}>
      <SectionCard section={scaling} open />
      <SectionCard section={fresh.sections[0]} open={false} />
    </div>
  ),
};

export const ConceptCardStatuses: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      {(["todo", "doing", "done"] as const).map((status) => (
        <ConceptCard key={status} concept={scaling.concepts[0].concept} status={status} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole("link");
    await expect(links.map((link) => link.getAttribute("data-status"))).toEqual(["todo", "doing", "done"]);
    await expect(links[0].getAttribute("aria-label")).toMatch(/Not started/);
  },
};
