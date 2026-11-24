import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowMarker } from "../../diagram/ArrowMarker";
import { Diagram } from "../../diagram/Diagram";
import { DiagramEdge } from "../../diagram/DiagramEdge";
import { DiagramNode } from "../../diagram/DiagramNode";
import { Figure } from "./Figure";

function Pipeline() {
  return (
    <Diagram viewBox="0 0 760 120" label="A client calls a load balancer which calls a server" minWidth={620}>
      <defs>
        <ArrowMarker id="figure-story-arrow" />
      </defs>
      <DiagramNode x={10} y={30} w={160} h={60} label="Client" sub="browser" />
      <DiagramEdge d="M 170 60 H 292" markerId="figure-story-arrow" label="HTTPS" lx={231} ly={50} />
      <DiagramNode x={300} y={30} w={160} h={60} label="Load Balancer" stroke="accent" />
      <DiagramEdge d="M 460 60 H 582" markerId="figure-story-arrow" />
      <DiagramNode x={590} y={30} w={160} h={60} label="App Server" sub="stateless" />
    </Diagram>
  );
}

const meta = {
  title: "Design System/Primitives/Figure",
  component: Figure,
  args: { caption: "Request path", scroll: true, children: <Pipeline /> },
} satisfies Meta<typeof Figure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCaption: Story = {};

export const ScrollsOnNarrowViewports: Story = {
  args: { caption: "Resize the canvas: the diagram pans instead of shrinking" },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Figure {...args} />
    </div>
  ),
};

export const Flush: Story = {
  args: {
    caption: undefined,
    flush: true,
    children: (
      <div style={{ padding: "28px 24px 24px" }}>
        <Pipeline />
        <div style={{ borderTop: "1px solid var(--sd-border)", marginTop: 20, paddingTop: 12 }} className="sd-text-xs">
          Flush figures own their padding, for a stepper strip or a footer that spans edge to edge.
        </div>
      </div>
    ),
  },
};
