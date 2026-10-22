import Link from "next/link";
import { studiesForConcept } from "@/lib/caseStudies";
import { bySlug } from "@/lib/concepts";
import styles from "./Concept.module.css";

/* Related concepts are authored per entry; related case studies come from the
   link caseStudies.ts already carries. Only half the concepts have a study, so
   that block is dropped entirely rather than rendered empty. */
export default function ConceptRail({ slug }: { slug: string }) {
  const entry = bySlug.get(slug);
  if (!entry) throw new Error(`Unknown concept slug: ${slug}`);

  const related = entry.concept.related
    .map((s) => bySlug.get(s))
    .filter((r) => r !== undefined);
  const studies = studiesForConcept(slug);

  return (
    <aside className={styles.rail} aria-label="Related reading">
      {related.length > 0 && (
        <section className={styles.railCard}>
          <h2 className={styles.railTitle}>Related concepts</h2>
          <ul className={styles.railList}>
            {related.map(({ concept, group }) => (
              <li key={concept.slug}>
                <Link href={`/concepts/${concept.slug}`} className={styles.railLink}>
                  <span className={styles.railLinkTitle}>{concept.title}</span>
                  <span className={styles.railLinkMeta}>
                    {group.title} · {concept.minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {studies.length > 0 && (
        <section className={styles.railCard}>
          <h2 className={styles.railTitle}>Related case studies</h2>
          <ul className={styles.railList}>
            {studies.map((study) => (
              <li key={study.url}>
                {/* Outbound to the original write-up, so it opens away from the page. */}
                <a
                  href={study.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.railLink}
                >
                  <span className={styles.railLinkTitle}>{study.title}</span>
                  <span className={styles.railLinkMeta}>
                    {study.company}
                    {study.kind ? ` · ${study.kind}` : ""}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Link href="/case-studies" className={styles.railMore}>
            All case studies
          </Link>
        </section>
      )}
    </aside>
  );
}
