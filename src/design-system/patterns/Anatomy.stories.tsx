import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import DeepDiveButton from "@/components/Button/DeepDiveButton";
import QuizCarousel from "@/components/Carousel/QuizCarousel";
import MarkerList from "@/components/MarkerList/MarkerList";
import PanelSection from "@/components/SidePanel/PanelSection";
import SidePanel from "@/components/SidePanel/SidePanel";
import { ArrowMarker } from "../diagram/ArrowMarker";
import { Diagram } from "../diagram/Diagram";
import { DiagramEdge } from "../diagram/DiagramEdge";
import { DiagramNode } from "../diagram/DiagramNode";
import { Badge } from "../primitives/Badge/Badge";
import { Callout, PanelNote } from "../primitives/Callout/Callout";
import { DataTable } from "../primitives/DataTable/DataTable";
import { Eyebrow } from "../primitives/Eyebrow/Eyebrow";
import { Figure } from "../primitives/Figure/Figure";
import { Heading } from "../primitives/Heading/Heading";
import { Prose } from "../primitives/Prose/Prose";
import { Strong, Text } from "../primitives/Text/Text";
import { ComparisonCard } from "./ComparisonCard/ComparisonCard";
import { DefinitionList } from "./DefinitionList/DefinitionList";
import { NumberedItem } from "./NumberedItem/NumberedItem";
import { PullQuote } from "./PullQuote/PullQuote";
import { QuizSection } from "./QuizSection/QuizSection";
import { Section } from "./Section/Section";
import { Versus } from "./Versus/Versus";

function ConceptBody() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div style={{ maxWidth: "var(--sd-page-max)", margin: "0 auto" }}>
      <Eyebrow variant="accent">Concept 1 · Scaling and Trade-offs · 11 min read</Eyebrow>
      <Heading level="page">Scalability: Vertical vs Horizontal Scaling</Heading>
      <Text variant="lede">Understanding how systems grow, and the trade-offs each approach demands.</Text>

      <Section eyebrow="Big Idea">
        <Prose size="lg">
          <p>
            There are only two ways to serve more load: more power for one machine (<Strong>vertical</Strong>), or
            more machines (<Strong>horizontal</Strong>).
          </p>
        </Prose>
      </Section>

      <Section eyebrow="Why This Exists" title="Why Capacity Is A Design Decision">
        <MarkerList
          mark="▸"
          color="var(--sd-accent)"
          items={[
            "At some point a single server runs out of CPU, memory, or disk I/O no matter how well it's tuned.",
            "A server holding state in local memory breaks the moment a request lands on a different machine.",
          ]}
        />
      </Section>

      <Section eyebrow="Think Of It Like" title="One Fast Cashier, Or Four Registers">
        <Prose>
          <p>A single cashier who gets faster is vertical scaling; opening three more registers is horizontal.</p>
          <p>More registers only help if any cashier can serve any customer.</p>
        </Prose>
        <PullQuote>&ldquo;I opened three registers and got three confused lines.&rdquo;</PullQuote>
      </Section>

      <Section eyebrow="The Shape Of It" title="Stateless Servers Behind A Load Balancer">
        <Figure caption="Request path" scroll>
          <Diagram viewBox="0 0 760 120" label="Client to load balancer to an app server">
            <defs>
              <ArrowMarker id="anatomy-arrow" />
            </defs>
            <DiagramNode x={10} y={30} w={160} h={60} label="Client" />
            <DiagramEdge d="M 170 60 H 292" markerId="anatomy-arrow" label="request" lx={231} ly={50} />
            <DiagramNode x={300} y={30} w={160} h={60} label="Load Balancer" stroke="accent" />
            <DiagramEdge d="M 460 60 H 582" markerId="anatomy-arrow" />
            <DiagramNode x={590} y={30} w={160} h={60} label="App Server" sub="× 3, stateless" stroke="teal" />
          </Diagram>
        </Figure>
        <Callout tone="accent">
          The app servers are <Strong>interchangeable</Strong>, which is the whole point.
        </Callout>
      </Section>

      <Section eyebrow="Compare" title="Scale Up Or Scale Out">
        <Versus
          left={<ComparisonCard label="Vertical" tone="amber" points={["Zero coordination overhead", "Hard hardware ceiling"]} />}
          right={<ComparisonCard label="Horizontal" tone="teal" points={["Built-in redundancy", "Distributed complexity"]} />}
        />
        <div style={{ marginTop: 16 }}>
          <DataTable
            caption="Vertical versus horizontal"
            columns={[
              { header: "Feature", tone: "muted", emphasis: true },
              { header: <Badge tone="amber">Vertical</Badge> },
              { header: <Badge tone="teal">Horizontal</Badge> },
            ]}
            rows={[
              ["Availability", "Single point of failure", "Redundancy by design"],
              ["Growth limit", "Physical hardware ceiling", "Theoretically unlimited"],
            ]}
          />
        </div>
      </Section>

      <Section eyebrow="Key Terms" title="The Vocabulary Of Growth">
        <DefinitionList
          items={[
            { title: "Statelessness", def: "No request data is kept in a server's memory between requests." },
            { title: "Elasticity", def: "Adding and removing capacity automatically with demand." },
          ]}
        />
        <div style={{ marginTop: 14 }}>
          <DeepDiveButton onClick={() => setPanelOpen(true)} label="Going further" />
        </div>
      </Section>

      <QuizSection>
        <QuizCarousel
          cards={[
            {
              question: "What does statelessness require in horizontal scaling?",
              answers: ["State moves to an external, shared layer such as a cache or distributed database."],
            },
          ]}
        />
      </QuizSection>

      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Going further">
        <PanelSection title="When to make the switch" defaultOpen>
          <Text>Four signals that it&rsquo;s time to go horizontal.</Text>
          <NumberedItem num="1" title="Availability Requirements">
            A vertical instance is a single point of failure.
          </NumberedItem>
          <PanelNote>Start vertical. Begin the shift at 60–70% of maximum capacity.</PanelNote>
        </PanelSection>
      </SidePanel>
    </div>
  );
}

const meta = {
  title: "Design System/Patterns/Concept Page Anatomy",
  component: ConceptBody,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ padding: "56px 24px 72px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConceptBody>;

export default meta;

export const BuiltFromTheDesignSystem: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 1 })).toHaveTextContent("Vertical vs Horizontal");
  },
};

export const OpensTheDeepDive: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Going further/ }));
    await expect(canvas.getByText("When to make the switch")).toBeInTheDocument();
  },
};
