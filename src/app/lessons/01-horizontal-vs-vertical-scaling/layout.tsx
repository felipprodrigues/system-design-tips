import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("01-horizontal-vs-vertical-scaling");

export default function Layout({ children }: LayoutProps<"/lessons/01-horizontal-vs-vertical-scaling">) {
  return children;
}
