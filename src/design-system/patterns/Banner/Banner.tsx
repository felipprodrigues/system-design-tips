import clsx from "clsx";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./Banner.module.css";

type LinkComponent = ElementType<{
  href: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}>;

export interface BannerProps extends Toned {
  href: string;
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  linkAs?: LinkComponent;
  className?: string;
}

export function Banner({
  href,
  title,
  eyebrow,
  description,
  icon,
  badge,
  tone = "accent",
  linkAs: LinkTag = "a",
  className,
}: BannerProps) {
  return (
    <LinkTag href={href} className={clsx(styles.banner, className)} style={toneVars(tone)}>
      {icon != null && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.body}>
        {eyebrow != null && <span className={styles.eyebrow}>{eyebrow}</span>}
        <span className={styles.title}>{title}</span>
        {description != null && <span className={styles.description}>{description}</span>}
      </span>
      {badge}
    </LinkTag>
  );
}
