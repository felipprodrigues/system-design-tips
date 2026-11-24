import clsx from "clsx";
import type { BlockquoteHTMLAttributes } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./PullQuote.module.css";

export type PullQuoteProps = BlockquoteHTMLAttributes<HTMLQuoteElement> & Toned;

export function PullQuote({ tone, className, style, ...rest }: PullQuoteProps) {
  return <blockquote className={clsx(styles.quote, className)} style={toneVars(tone, style)} {...rest} />;
}
