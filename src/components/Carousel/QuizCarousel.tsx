"use client";

import { useState } from "react";
import styles from "./QuizCarousel.module.css";

export interface QuizCard {
  question: string;
  answers: string[];
  note?: string;
}

interface QuizCarouselProps {
  cards: QuizCard[];
}

export default function QuizCarousel({ cards }: QuizCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = cards.length;

  function goTo(n: number) {
    setCurrent(Math.max(0, Math.min(total - 1, n)));
  }

  const card = cards[current];

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.num}>Question {current + 1} of {total}</p>
        <p className={styles.question}>{card.question}</p>
        <ul className={styles.answers}>
          {card.answers.map((a, i) => (
            <li key={i}>
              <span className={styles.check}>✓</span>
              {a}
            </li>
          ))}
        </ul>
        {card.note && (
          <div className={styles.note}>
            <strong>Note:</strong> {card.note}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
        >
          ← Prev
        </button>

        <div className={styles.dots}>
          {cards.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>

        <button
          className={styles.btn}
          onClick={() => goTo(current + 1)}
          disabled={current === total - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
