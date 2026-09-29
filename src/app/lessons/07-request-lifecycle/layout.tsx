import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("07-request-lifecycle");

export default function Layout({ children }: LayoutProps<"/lessons/07-request-lifecycle">) {
  return children;
}
