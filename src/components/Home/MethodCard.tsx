import Link from "next/link";
import styles from "./MethodCard.module.css";

/* Sits above the tracks rather than inside one: the walkthrough is the order you work
   in when applying the lessons, not a lesson with a place in the sequence. */

export default function MethodCard() {
  return (
    <Link href="/walkthrough" className={styles.card}>
      <p className={styles.eyebrow}>The Method</p>
      <h2 className={styles.title}>A 7-Step Walkthrough for Any System Design</h2>
      <p className={styles.blurb}>
        The order to work in when you&rsquo;re handed a blank page and a vague problem.
      </p>
      <span className={styles.arrow} aria-hidden="true">→</span>
    </Link>
  );
}
