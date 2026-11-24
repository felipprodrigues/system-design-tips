import type { Meta, StoryObj } from "@storybook/react-vite";
import { Database, Monitor, Server } from "lucide-react";
import { expect, within } from "storybook/test";
import { Figure } from "../primitives/Figure/Figure";
import { ArrowMarker } from "./ArrowMarker";
import { Diagram } from "./Diagram";
import { DiagramEdge } from "./DiagramEdge";
import { DiagramNode } from "./DiagramNode";
import { Lifelines, Message } from "./Sequence";

const meta = {
  title: "Design System/Diagram/Kit",
  component: Diagram,
  args: { viewBox: "0 0 990 470", label: "", children: null },
} satisfies Meta<typeof Diagram>;

export default meta;
type Story = StoryObj<typeof meta>;

const servers = [35, 195, 355];

export const StatelessFleet: Story = {
  render: () => (
    <Figure caption="Stateless servers behind a load balancer" scroll>
      <Diagram
        viewBox="0 0 990 470"
        title="Stateless servers behind a load balancer"
        label="A client sends a request to a load balancer, which spreads it over three interchangeable app servers that share one session store."
      >
        <defs>
          <ArrowMarker id="kit-fleet-arrow" />
        </defs>
        <DiagramEdge d="M 176 235 H 262" markerId="kit-fleet-arrow" label="request" lx={219} ly={222} />
        <DiagramEdge d="M 450 235 H 500 V 75 H 532" markerId="kit-fleet-arrow" />
        <DiagramEdge d="M 500 235 H 532" markerId="kit-fleet-arrow" />
        <DiagramEdge d="M 500 235 V 395 H 532" markerId="kit-fleet-arrow" />
        {servers.map((y) => (
          <DiagramEdge key={y} d={`M 710 ${y + 40} H 805 V 235 H 822`} markerId="kit-fleet-arrow" />
        ))}
        <DiagramNode x={16} y={195} w={160} h={80} kind="Client" label="Client" />
        <DiagramNode x={270} y={195} w={180} h={80} kind="LB" label="Load Balancer" stroke="accent" kindColor="accent" />
        {servers.map((y, i) => (
          <DiagramNode key={y} x={540} y={y} w={170} h={80} kind="Server" label={`App Server ${i + 1}`} stroke="teal" kindColor="teal" />
        ))}
        <DiagramNode x={830} y={195} w={150} h={80} kind="Cache" label="Session Store" stroke="green" kindColor="green" />
      </Diagram>
    </Figure>
  ),
  play: async ({ canvasElement }) => {
    const svg = within(canvasElement).getByRole("img", { name: /load balancer/ });
    await expect(svg.querySelectorAll("marker")).toHaveLength(1);
    await expect(svg.querySelector("title")?.textContent).toBe("Stateless servers behind a load balancer");
  },
};

export const CompactNodes: Story = {
  render: () => (
    <Figure scroll>
      <Diagram viewBox="0 0 760 130" label="Compact nodes with a sub label, one dimmed edge">
        <defs>
          <ArrowMarker id="kit-compact-arrow" />
        </defs>
        <DiagramNode x={10} y={35} w={170} h={60} label="Browser" sub="cache miss" />
        <DiagramEdge d="M 180 65 H 292" markerId="kit-compact-arrow" label="GET /logo.png" lx={236} ly={55} />
        <DiagramNode x={300} y={35} w={170} h={60} label="Edge PoP" sub="Frankfurt" stroke="accent" />
        <DiagramEdge d="M 470 65 H 582" markerId="kit-compact-arrow" dim label="origin pull" lx={526} ly={55} />
        <DiagramNode x={590} y={35} w={160} h={60} label="Origin" dashed opacity={0.6} />
      </Diagram>
    </Figure>
  ),
};

const lanes = [
  { label: "Browser", x: 120, icon: Monitor },
  { label: "App server", x: 420, icon: Server },
  { label: "Database", x: 720, icon: Database, accent: true },
];

export const Sequence: Story = {
  render: () => (
    <Figure caption="Read path" scroll>
      <Diagram viewBox="0 0 840 250" label="The browser asks the app server, which reads the database and answers" minWidth={640}>
        <defs>
          <ArrowMarker id="kit-seq-arrow" />
          <ArrowMarker id="kit-seq-arrow-danger" color="danger" />
        </defs>
        <Lifelines lanes={lanes} bottom={240} />
        <Message from={120} to={420} y={90} label="GET /photos/42" markerId="kit-seq-arrow" />
        <Message from={420} to={720} y={130} label="SELECT … WHERE id = 42" markerId="kit-seq-arrow" />
        <Message from={720} to={420} y={170} label="timeout after 2s" markerId="kit-seq-arrow-danger" color="danger" />
        <Message from={420} to={120} y={210} label="503 Retry-After: 1" markerId="kit-seq-arrow" />
      </Diagram>
    </Figure>
  ),
};
