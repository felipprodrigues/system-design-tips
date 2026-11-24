// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import {
  ArrowMarker,
  Badge,
  Banner,
  Button,
  Callout,
  Card,
  Chip,
  ChipGroup,
  ComparisonCard,
  DataTable,
  DefinitionList,
  Diagram,
  DiagramEdge,
  DiagramNode,
  DotList,
  Eyebrow,
  Figure,
  Heading,
  Highlight,
  IconButton,
  Lifelines,
  Message,
  NumberBadge,
  NumberedItem,
  PanelNote,
  ProgressBar,
  Prose,
  PullQuote,
  QuizSection,
  Section,
  Strong,
  Text,
  Versus,
} from "./index";

test("this file really runs without a DOM", () => {
  expect(typeof document).toBe("undefined");
});

test("every design-system component renders on the server, so pages can use them without 'use client'", () => {
  const html = renderToStaticMarkup(
    <>
      <Section eyebrow="E" title="T">
        <Eyebrow variant="sub">e</Eyebrow>
        <Heading level="page">h</Heading>
        <Text>
          <Strong>s</Strong> <Highlight tone="accent">h</Highlight>
        </Text>
        <Prose size="lg">
          <p>p</p>
        </Prose>
        <Card variant="panel" title="c" tone="teal" />
        <Callout tone="danger">c</Callout>
        <PanelNote tone="green">n</PanelNote>
        <Badge variant="pill" tone="done">b</Badge>
        <ChipGroup label="g">
          <Chip pressed count={2}>c</Chip>
        </ChipGroup>
        <Button variant="tinted" tone="teal">b</Button>
        <IconButton label="Close">x</IconButton>
        <NumberBadge>1</NumberBadge>
        <ProgressBar value={50} label="p" />
        <DataTable columns={[{ header: "h", tone: "amber" }]} rows={[["r"]]} caption="t" />
        <DefinitionList items={[{ title: "t", def: "d" }]} />
        <NumberedItem num="1" title="t">b</NumberedItem>
        <DotList items={["a"]} />
        <Versus left={<ComparisonCard label="L" points={["a"]} />} right={<ComparisonCard label="R" footer="f" />} />
        <PullQuote>q</PullQuote>
        <Banner href="/x" title="b" icon={<svg />} />
        <Figure caption="f" scroll>
          <Diagram viewBox="0 0 10 10" label="d">
            <defs>
              <ArrowMarker id="m" />
            </defs>
            <DiagramNode x={0} y={0} w={10} h={10} label="n" />
            <DiagramEdge d="M 0 0 H 1" markerId="m" label="e" lx={0} ly={0} />
            <Lifelines lanes={[{ label: "A", x: 5 }]} bottom={10} />
            <Message from={0} to={5} y={5} label="m" markerId="m" />
          </Diagram>
        </Figure>
      </Section>
      <QuizSection>q</QuizSection>
    </>,
  );
  expect(html).toContain('class="sd-section"');
  expect(html).toContain('class="sd-quiz"');
});
