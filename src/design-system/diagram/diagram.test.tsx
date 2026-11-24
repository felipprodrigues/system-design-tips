import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { ArrowMarker } from "./ArrowMarker";
import { Diagram } from "./Diagram";
import { DiagramEdge } from "./DiagramEdge";
import { DiagramNode } from "./DiagramNode";
import { Message } from "./Sequence";

test("the arrow marker is the one eighteen figures declare by hand", () => {
  expect(renderToStaticMarkup(<ArrowMarker id="sd-fleet-arrow" />)).toBe(
    '<marker id="sd-fleet-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sd-muted)"></path></marker>',
  );
});

test("marker colours accept tones and the two border tokens", () => {
  expect(renderToStaticMarkup(<ArrowMarker id="a" color="danger" />)).toContain('fill="var(--sd-danger)"');
  expect(renderToStaticMarkup(<ArrowMarker id="b" color="border-strong" />)).toContain('fill="var(--sd-border-strong)"');
});

test("a diagram is an image by default and a group when it holds controls", () => {
  const { rerender } = render(<Diagram viewBox="0 0 10 10" label="Fleet">{null}</Diagram>);
  expect(screen.getByRole("img", { name: "Fleet" })).toBeDefined();
  rerender(
    <Diagram viewBox="0 0 10 10" label="Stepper" interactive>
      {null}
    </Diagram>,
  );
  expect(screen.getByRole("group", { name: "Stepper" })).toBeDefined();
});

test("a compact node reproduces the CDN and rate-limiting Node geometry", () => {
  const { container } = render(
    <svg>
      <DiagramNode x={10} y={20} w={100} h={50} label="Edge" sub="Frankfurt" stroke="accent" />
    </svg>,
  );
  const [label, sub] = [...container.querySelectorAll("text")];
  expect(container.querySelector("rect")?.getAttribute("stroke")).toBe("var(--sd-accent)");
  expect(label.getAttribute("y")).toBe(String(20 + 25 - 3));
  expect(sub.getAttribute("y")).toBe(String(20 + 25 + 15));
});

test("a kind node upper-cases the kind above the label", () => {
  const { container } = render(
    <svg>
      <DiagramNode x={0} y={0} w={160} h={80} kind="Server" label="App Server 1" />
    </svg>,
  );
  expect([...container.querySelectorAll("text")].map((t) => t.textContent)).toEqual(["SERVER", "App Server 1"]);
});

test("a dimmed edge drops to the hairline border and dashes", () => {
  const { container } = render(
    <svg>
      <DiagramEdge d="M 0 0 H 10" markerId="m" dim />
    </svg>,
  );
  const path = container.querySelector("path");
  expect(path?.getAttribute("stroke")).toBe("var(--sd-border)");
  expect(path?.getAttribute("stroke-dasharray")).toBe("4 4");
  expect(path?.getAttribute("marker-end")).toBe("url(#m)");
});

test("a message stops short of its target lifeline so the arrowhead is visible", () => {
  const { container } = render(
    <svg>
      <Message from={100} to={400} y={50} label="GET" markerId="m" />
      <Message from={400} to={100} y={90} label="200" markerId="m" />
    </svg>,
  );
  const [right, left] = [...container.querySelectorAll("line")];
  expect(right.getAttribute("x2")).toBe("394");
  expect(left.getAttribute("x2")).toBe("106");
});

test("a className reaches the svg alongside the sizing style", () => {
  render(
    <Diagram viewBox="0 0 10 10" label="Stack" className="stack">
      {null}
    </Diagram>,
  );
  const svg = screen.getByRole("img", { name: "Stack" });
  expect(svg.getAttribute("class")).toBe("stack");
  expect(svg.style.minWidth).toBe("620px");
});

test("without a className the svg has no class attribute at all", () => {
  render(
    <Diagram viewBox="0 0 10 10" label="Plain">
      {null}
    </Diagram>,
  );
  expect(screen.getByRole("img", { name: "Plain" }).hasAttribute("class")).toBe(false);
});

test("a caller's style merges over the defaults rather than replacing them", () => {
  render(
    <Diagram viewBox="0 0 10 10" label="Styled" minWidth={500} style={{ maxWidth: 700 }}>
      {null}
    </Diagram>,
  );
  const svg = screen.getByRole("img", { name: "Styled" });
  expect([svg.style.width, svg.style.minWidth, svg.style.maxWidth, svg.style.display]).toEqual(["100%", "500px", "700px", "block"]);
});
