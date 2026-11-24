import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { QuizSection } from "./QuizSection";

test("the default heading is the one all eighteen quiz blocks repeat", () => {
  expect(renderToStaticMarkup(<QuizSection>carousel</QuizSection>)).toBe(
    '<div class="sd-quiz"><p class="sd-eyebrow-accent">Quiz Review</p><p class="sd-quiz-title">Check your understanding</p>carousel</div>',
  );
});
