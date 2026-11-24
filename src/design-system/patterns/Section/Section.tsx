import clsx from "clsx";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { Eyebrow } from "../../primitives/Eyebrow/Eyebrow";
import { Heading } from "../../primitives/Heading/Heading";

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  titleAs?: "h2" | "h3";
  ref?: Ref<HTMLElement>;
}

export function Section({ eyebrow, title, titleAs, className, children, ...rest }: SectionProps) {
  return (
    <section className={clsx("sd-section", className)} {...rest}>
      {eyebrow != null && <Eyebrow>{eyebrow}</Eyebrow>}
      {title != null && <Heading as={titleAs}>{title}</Heading>}
      {children}
    </section>
  );
}
