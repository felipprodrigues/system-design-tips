import styles from "./Hero.module.css";

interface HeroProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

/** The opening block every top-level page shares: eyebrow, headline, one paragraph. */
export default function Hero({ eyebrow, title, children }: HeroProps) {
  return (
    <div className={styles.hero}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.intro}>{children}</p>
    </div>
  );
}
