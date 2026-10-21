import { groups } from "@/lib/concepts";
import { conceptMetadata } from "@/lib/seo";

/* Every concept body lives in src/concepts/<slug>.tsx and is a client component, so none of
   them can carry their own metadata. This one server route supplies it for all of them.
   dynamicParams: false means an unlisted slug 404s instead of reaching the import. */

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
  return <ConceptBody />;
}
