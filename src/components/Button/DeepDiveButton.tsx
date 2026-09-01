import styles from "./DeepDiveButton.module.css";

interface DeepDiveButtonProps {
  onClick: () => void;
  label?: string;
}

export default function DeepDiveButton({
  onClick,
  label = "Deep Dive",
}: DeepDiveButtonProps) {
  return (
    <button className={styles.btn} onClick={onClick}>
      <span className={styles.icon}>↗</span>
      {label}
    </button>
  );
}
