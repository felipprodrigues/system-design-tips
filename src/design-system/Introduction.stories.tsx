import type { Meta, StoryObj } from "@storybook/react-vite";
import { Callout } from "./primitives/Callout/Callout";
import { DataTable } from "./primitives/DataTable/DataTable";
import { Heading } from "./primitives/Heading/Heading";
import { Prose } from "./primitives/Prose/Prose";
import { Strong, Text } from "./primitives/Text/Text";
import { Section } from "./patterns/Section/Section";

function Introduction() {
  return (
    <div style={{ maxWidth: "var(--sd-page-max)" }}>
      <Heading level="page">System Design Bits: design system</Heading>
      <Text variant="lede">One source of truth for how every page looks, built from what the site already does.</Text>

      <Section eyebrow="How it is layered" title="Tokens, classes, components">
        <DataTable
          caption="Design system layers"
          columns={[
            { header: "Layer", emphasis: true, nowrap: true },
            { header: "Where it lives", mono: true },
            { header: "What it is for", tone: "muted" },
          ]}
          rows={[
            ["Tokens", "src/styles/tokens.css", "Every colour, font, measure and radius, with a light-mode override"],
            ["Shared classes", "src/styles/concept.css", "The sd-* classes concept bodies use; still live, and the components render them"],
            ["Primitives", "src/design-system/primitives", "Typed building blocks: Eyebrow, Card, Callout, Badge, Chip, Button…"],
            ["Patterns", "src/design-system/patterns", "Repeated compositions: Section, QuizSection, ComparisonCard, Banner…"],
            ["Diagram", "src/design-system/diagram", "The SVG kit every concept figure re-implemented: markers, nodes, edges, lifelines"],
            ["Components", "src/components", "Existing shared components, re-exported from @/design-system until they move"],
          ]}
        />
      </Section>

      <Section eyebrow="Using it" title="Import from one place">
        <Prose>
          <p>
            <code>{'import { Section, Callout, Figure, QuizCarousel } from "@/design-system";'}</code>
          </p>
          <p>
            Components that wrap an existing class render <Strong>that class</Strong>, so a migrated call site is
            pixel-identical and the stylesheet stays the single definition. Colour is a typed <code>tone</code> prop
            rather than a raw string, and washes are mixed from the tone&rsquo;s token, so they follow light mode.
          </p>
        </Prose>
        <Callout tone="accent">
          Nothing was removed. Pages still use the sd-* classes and src/components directly; moving them onto these
          components is the next iteration, one page at a time. See src/design-system/README.md for the map.
        </Callout>
      </Section>

      <Section eyebrow="Testing" title="Every story is a test">
        <Prose>
          <p>
            <code>npm test</code> runs each story in jsdom through Vitest, including its <code>play</code> function,
            so an interaction written once in Storybook is asserted in CI. Foundation catalogs are checked against the
            stylesheets, so a token or class added without documentation fails the build.
          </p>
        </Prose>
      </Section>
    </div>
  );
}

const meta = {
  title: "Design System/Introduction",
  component: Introduction,
} satisfies Meta<typeof Introduction>;

export default meta;

export const Overview: StoryObj<typeof meta> = {};
