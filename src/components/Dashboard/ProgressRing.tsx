import styles from "./Dashboard.module.css";

interface ProgressRingProps {
  percent: number;
  /** Outer diameter in px. The stroke scales with it. */
  size?: number;
  label?: string;
}

/* A stroked circle rather than an arc path: dasharray does the maths, so there is
   no trigonometry to get wrong and no edge case at 0 or 100 percent. */
export default function ProgressRing({ percent, size = 72, label }: ProgressRingProps) {
  const stroke = Math.max(4, Math.round(size / 12));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={styles.ring} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--sd-border-strong)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--sd-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={styles.ringValue}
        />
      </svg>
      {label && <span className={styles.ringLabel}>{label}</span>}
    </div>
  );
}
