import type { LessonGroup } from "@/lib/lessons";
import GroupCard from "./GroupCard";
import styles from "./TopicTracks.module.css";

/* The connector has to line up with the grid columns below it, so the gap
   lives here and feeds both. Keeping it in one place is what stops the lines
   drifting off the cards when a topic is added. */
const GRID_GAP = 20;

/* Centre of column `i` in a grid of `count` equal tracks separated by GRID_GAP.
   Derived rather than hardcoded so the connector keeps aligning as groups are
   added. Equal tracks are symmetric, so the last centre mirrors the first. */
function columnCentre(i: number, count: number) {
  const track = `((100% - ${(count - 1) * GRID_GAP}px) / ${count})`;
  return `calc(${track} * ${i + 0.5} + ${i * GRID_GAP}px)`;
}

export default function TopicTracks({ groups }: { groups: LessonGroup[] }) {
  const edge = columnCentre(0, groups.length);

  return (
    <>
      {/* The root branches down into each topic track below. */}
      <div className={styles.connector} aria-hidden="true">
        <span className={styles.stem} />
        <span className={styles.bar} style={{ left: edge, right: edge }} />
        {groups.map((group, i) => (
          <span
            key={group.title}
            className={styles.drop}
            style={{ left: columnCentre(i, groups.length) }}
          />
        ))}
      </div>

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${groups.length}, 1fr)`, gap: GRID_GAP }}
      >
        {groups.map((group) => (
          <GroupCard key={group.title} group={group} collapsible />
        ))}
      </div>
    </>
  );
}
