import { groups } from "@/lib/lessons";
import { lessonMetadata } from "@/lib/seo";

/* Every lesson body lives in src/lessons/<slug>.tsx and is a client component, so none of
   them can carry their own metadata. This one server route supplies it for all of them.
   dynamicParams: false means an unlisted slug 404s instead of reaching the import. */

export const dynamicParams = false;

export function generateStaticParams() {
  return groups.flatMap((group) => group.lessons.map(({ slug }) => ({ slug })));
}

export async function generateMetadata({ params }: PageProps<"/lessons/[slug]">) {
  return lessonMetadata((await params).slug);
}

export default async function LessonPage({ params }: PageProps<"/lessons/[slug]">) {
  const { slug } = await params;
  const { default: LessonBody } = await import(`../../../lessons/${slug}.tsx`);
  return <LessonBody />;
}
