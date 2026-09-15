import type { ReactNode } from "react";

interface TermProps {
  label: string;
  children: ReactNode;
}

export default function Term({ label, children }: TermProps) {
  return (
    <span className="sd-term" tabIndex={0}>
      {label}
      <span className="sd-term-icon" aria-hidden="true">ⓘ</span>
      <span className="sd-term-card" role="tooltip">{children}</span>
    </span>
  );
}
