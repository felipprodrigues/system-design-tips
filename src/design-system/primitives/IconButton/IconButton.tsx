import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";
import styles from "./IconButton.module.css";

export type IconButtonVariant = "soft" | "outline" | "ghost";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  label: string;
  variant?: IconButtonVariant;
  size?: "sm" | "md";
}

export function IconButton({ label, variant = "soft", size = "md", className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={clsx(styles.icon, styles[variant], size === "sm" && styles.sm, className)}
      {...rest}
    />
  );
}
