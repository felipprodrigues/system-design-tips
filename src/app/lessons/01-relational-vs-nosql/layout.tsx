import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("01-relational-vs-nosql");

export default function Layout({ children }: LayoutProps<"/lessons/01-relational-vs-nosql">) {
  return children;
}
