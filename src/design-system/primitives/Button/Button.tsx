import clsx from "clsx";
import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./Button.module.css";

export type ButtonVariant = "ghost" | "secondary" | "pill" | "tinted";

export interface ButtonStyleOptions extends Toned {
  variant?: ButtonVariant;
  className?: string;
  style?: CSSProperties;
}

/* Framework-free on purpose: spread the result onto next/link or any anchor to
   give a link the button look without the design system importing Next. */
export function buttonStyles({ variant = "ghost", tone, className, style }: ButtonStyleOptions = {}) {
  return {
    className: clsx(styles.button, styles[variant], className),
    style: toneVars(tone, style),
    "data-variant": variant,
  };
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Toned {
  variant?: ButtonVariant;
}

export function Button({ variant, tone, className, style, type = "button", ...rest }: ButtonProps) {
  return <button type={type} {...buttonStyles({ variant, tone, className, style })} {...rest} />;
}
