"use client";

import { useRef, type ReactNode } from "react";

interface TermProps {
  label: string;
  /* Turns the term into a link. The card is a DOM descendant of the anchor even
     though it paints in the top layer, so a click anywhere inside it navigates. */
  href?: string;
  children: ReactNode;
}

/* The card is a popover, so it paints in the top layer: a definition inside a
   side panel or any scrolling box would otherwise be cut off at that box's edge.
   Nothing in the top layer has a containing block but the viewport, which is why
   the position is measured here rather than declared in CSS. */
const GAP = 10;
const EDGE = 10;
const GRACE = 140;

export default function Term({ label, href, children }: TermProps) {
  const host = useRef<HTMLElement>(null);
  const card = useRef<HTMLSpanElement>(null);
  const grace = useRef<number | undefined>(undefined);
  const width = href ? 300 : 240;

  function show() {
    clearTimeout(grace.current);
    const h = host.current;
    const c = card.current;
    if (!h || !c || c.matches(":popover-open")) return;

    const r = h.getBoundingClientRect();
    const centred = r.left + r.width / 2 - width / 2;
    c.style.width = `${width}px`;
    c.style.left = `${Math.min(Math.max(EDGE, centred), window.innerWidth - width - EDGE)}px`;

    /* Flips under the word when the word is too close to the top to sit above it. */
    const below = r.top < 170;
    c.style.top = below ? `${r.bottom + GAP}px` : "auto";
    c.style.bottom = below ? "auto" : `${window.innerHeight - r.top + GAP}px`;

    c.showPopover();
    /* Fixed coordinates go stale the moment anything scrolls underneath. */
    window.addEventListener("scroll", close, { capture: true, once: true });
  }

  function close() {
    const c = card.current;
    if (c?.matches(":popover-open")) c.hidePopover();
  }

  /* Delayed so the pointer can cross the gap between the word and the card
     without the card closing on the way. */
  function hide() {
    clearTimeout(grace.current);
    grace.current = window.setTimeout(close, GRACE);
  }

  const inner = (
    <>
      {label}
      <span
        className="sd-term-card"
        role={href ? undefined : "tooltip"}
        popover="manual"
        ref={card}
        onPointerEnter={show}
        onPointerLeave={hide}
      >
        {children}
        {href ? <span className="sd-term-go">Open the page →</span> : null}
      </span>
    </>
  );

  const handlers = {
    onPointerEnter: show,
    onPointerLeave: hide,
    onFocus: show,
    onBlur: hide,
  };

  if (href) {
    return (
      <a
        className="sd-term sd-term-cta"
        href={href}
        ref={host as React.RefObject<HTMLAnchorElement>}
        {...handlers}
      >
        {inner}
      </a>
    );
  }

  return (
    <span
      className="sd-term"
      tabIndex={0}
      ref={host as React.RefObject<HTMLSpanElement>}
      {...handlers}
    >
      {inner}
    </span>
  );
}
