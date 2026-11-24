import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { Eyebrow } from "../../primitives/Eyebrow/Eyebrow";

export interface QuizSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
}

/* Keeps the .sd-quiz class: ConceptLayout reorders the block by it on phones. */
export function QuizSection({
  eyebrow = "Quiz Review",
  title = "Check your understanding",
  className,
  children,
  ...rest
}: QuizSectionProps) {
  return (
    <div className={clsx("sd-quiz", className)} {...rest}>
      <Eyebrow variant="accent">{eyebrow}</Eyebrow>
      <p className="sd-quiz-title">{title}</p>
      {children}
    </div>
  );
}
