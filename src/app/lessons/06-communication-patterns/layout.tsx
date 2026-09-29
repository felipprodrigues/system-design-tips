import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("06-communication-patterns");

export default function Layout({ children }: LayoutProps<"/lessons/06-communication-patterns">) {
  return children;
}
