import { bySlug } from "@/lib/concepts";
import styles from "./Concept.module.css";

interface ConceptHeaderProps {
  slug: string;
}

/* The same eyebrow-and-title block was inline-styled into all fourteen bodies.
   Title, number, section and read time all come from the concept index, so the
   body passes a slug and nothing else. */
export default function ConceptHeader({ slug }: ConceptHeaderProps) {
  const entry = bySlug.get(slug);
  if (!entry) throw new Error(`Unknown concept slug: ${slug}`);
  const { concept, group } = entry;

  const position = group.concepts.findIndex((c) => c.slug === slug) + 1;

  return (
    <>
      <p className={styles.eyebrow}>
        {concept.label ?? `Concept ${position} · ${group.title}`}
        <span className={styles.dot}>·</span>
        {concept.minutes} min read
      </p>
      <h1 className="sd-h1">{concept.title}</h1>
    </>
  );
}
