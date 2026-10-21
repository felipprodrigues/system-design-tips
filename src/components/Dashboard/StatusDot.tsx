import { STATUS_LABEL, type Status } from "@/lib/progress";
import styles from "./Dashboard.module.css";

/* Done is a filled check, in progress a half-filled ring, not started an empty one.
   The shape carries the meaning on its own — colour alone would fail anyone who
   can't separate the green from the indigo. */
export default function StatusDot({ status }: { status: Status }) {
  return (
    <span className={styles.dot} data-status={status} role="img" aria-label={STATUS_LABEL[status]}>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="8" cy="8" r="6.4" />
        {status === "done" && <path d="m5.2 8.2 2 2 3.6-4" strokeLinecap="round" strokeLinejoin="round" />}
        {status === "doing" && <path d="M8 1.6a6.4 6.4 0 0 1 0 12.8Z" fill="currentColor" stroke="none" />}
      </svg>
    </span>
  );
}
