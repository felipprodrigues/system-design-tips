/* Lesson body copy sits in --sd-muted, which reads flat over long stretches.
   Wrap the load-bearing phrase of a sentence in *asterisks* to lift it to
   --sd-text, so each card has one thing the eye lands on. One or two per item;
   more and nothing stands out. */
export function hl(text: string) {
  return text
    .split(/\*([^*]+)\*/g)
    .map((part, i) => (i % 2 === 1 ? <strong key={i} className="sd-strong">{part}</strong> : part));
}
