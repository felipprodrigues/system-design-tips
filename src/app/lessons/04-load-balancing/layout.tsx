import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("04-load-balancing");

export default function Layout({ children }: LayoutProps<"/lessons/04-load-balancing">) {
  return children;
}
