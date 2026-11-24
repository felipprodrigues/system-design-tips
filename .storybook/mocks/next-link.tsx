import { forwardRef, type AnchorHTMLAttributes } from "react";
import type { UrlObject } from "./next-navigation";

type Href = string | UrlObject;

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: Href;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
};

const ROUTER_ONLY = new Set(["prefetch", "replace", "scroll"]);

function toHref(href: Href) {
  if (typeof href === "string") return href;
  const query = href.query ? `?${new URLSearchParams(href.query)}` : "";
  return `${href.pathname ?? ""}${query}`;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, ...props }, ref) {
  const anchorProps = Object.fromEntries(Object.entries(props).filter(([key]) => !ROUTER_ONLY.has(key)));
  return <a ref={ref} href={toHref(href)} {...anchorProps} />;
});

export default Link;
