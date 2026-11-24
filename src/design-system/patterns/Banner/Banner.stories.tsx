import Link from "next/link";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "../../primitives/Badge/Badge";
import { Banner } from "./Banner";

const Compass = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7.5" />
    <path d="m13.2 6.8-2.1 4.3-4.3 2.1 2.1-4.3 4.3-2.1Z" />
  </svg>
);

const Screen = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
    <rect x="2.5" y="4" width="15" height="12" rx="1.2" />
    <path d="M2.5 7.5h15" />
  </svg>
);

const meta = {
  title: "Design System/Patterns/Banner",
  component: Banner,
  args: {
    href: "/walkthrough",
    tone: "warm",
    icon: Compass,
    eyebrow: "The Method",
    title: "A 7-step walkthrough",
    description: "The order to work in when you're handed a blank page and a vague problem.",
    linkAs: Link,
  },
  render: (args) => (
    <div style={{ maxWidth: 540 }}>
      <Banner {...args} />
    </div>
  ),
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Method: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: /A 7-step walkthrough/ });
    await expect(link).toHaveAttribute("href", "/walkthrough");
  },
};

export const WithBadge: Story = {
  args: {
    href: "/frontend",
    tone: "pink",
    icon: Screen,
    eyebrow: "The map",
    title: "A 9-step walkthrough to Frontend System Design",
    description: "Nine stages, one stack, and a decision list per stage.",
    badge: (
      <Badge variant="pill" tone="pink">
        Frontend
      </Badge>
    ),
  },
};

export const DestinationHues: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, maxWidth: 900 }}>
      <Banner linkAs={Link} href="/walkthrough" tone="warm" icon={Compass} eyebrow="The Method" title="A 7-step walkthrough" />
      <Banner linkAs={Link} href="/case-studies" tone="accent" icon={Compass} eyebrow="Case studies" title="System blueprints" />
      <Banner linkAs={Link} href="/concepts/scaling-a-photo-app" tone="violet" icon={Compass} eyebrow="Capstone" title="Scaling a Photo App" />
      <Banner linkAs={Link} href="/frontend" tone="pink" icon={Screen} eyebrow="The map" title="Frontend System Design" />
    </div>
  ),
};
