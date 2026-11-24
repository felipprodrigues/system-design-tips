import { forwardRef, type AnchorHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Banner } from "./Banner";

test("a banner is one link whose name includes its eyebrow and title", () => {
  render(<Banner href="/walkthrough" eyebrow="The Method" title="A 7-step walkthrough" description="The order." />);
  const link = screen.getByRole("link");
  expect(link.getAttribute("href")).toBe("/walkthrough");
  expect(link.textContent).toContain("The Method");
  expect(link.textContent).toContain("A 7-step walkthrough");
});

test("the icon is decorative", () => {
  render(<Banner href="/x" title="T" icon={<svg data-testid="icon" />} />);
  expect(screen.getByTestId("icon").parentElement?.getAttribute("aria-hidden")).toBe("true");
});

test("any link component can render it, which is how next/link plugs in", () => {
  const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function RouterLink(props, ref) {
    return <a ref={ref} data-router="yes" {...props} />;
  });
  render(<Banner href="/frontend" title="Frontend" tone="pink" linkAs={RouterLink} />);
  const link = screen.getByRole("link", { name: "Frontend" });
  expect(link.dataset.router).toBe("yes");
  expect(link.style.getPropertyValue("--ds-tone")).toBe("var(--sd-pink)");
});

test("the tone defaults to accent, so a banner is never left without a hue", () => {
  render(<Banner href="/x" title="Plain" />);
  expect(screen.getByRole("link").style.getPropertyValue("--ds-tone")).toBe("var(--sd-accent)");
});
