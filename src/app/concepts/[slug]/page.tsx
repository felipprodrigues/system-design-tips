import { Breadcrumb, PageNav } from "@/components";
import ConceptLayout from "@/components/Concept/ConceptLayout";
import ConceptRail from "@/components/Concept/ConceptRail";
import { bySlug, getConceptNav, groups } from "@/lib/concepts";
import { conceptMetadata } from "@/lib/seo";

/* Every concept body lives in src/concepts/<slug>.tsx and is a client component, so none of
   them can carry their own metadata. This one server route supplies it for all of them.
   dynamicParams: false means an unlisted slug 404s instead of reaching the import.

   The route also owns the page chrome — breadcrumb, two-column layout, rail and
   footer nav — because the rail has to sit beside the content column and the
   bodies cannot provide that from inside it. A body is its content, nothing more. */

export const dynamicParams = false;

export function generateStaticParams() {
  return groups.flatMap((group) => group.concepts.map(({ slug }) => ({ slug })));
}

export async function generateMetadata({ params }: PageProps<"/concepts/[slug]">) {
  return conceptMetadata((await params).slug);
}

export default async function ConceptPage({ params }: PageProps<"/concepts/[slug]">) {
  const { slug } = await params;
  const { default: ConceptBody } = await import(`../../../concepts/${slug}.tsx`);
  const nav = getConceptNav(slug);
  const { concept } = bySlug.get(slug)!;

  return (
    <>
      <Breadcrumb section={nav.sectionTitle} concept={concept.title} />

      <ConceptLayout rail={<ConceptRail slug={slug} />}>
        <ConceptBody />
      </ConceptLayout>

      <PageNav {...nav} label={concept.label} />
    </>
  );
}
