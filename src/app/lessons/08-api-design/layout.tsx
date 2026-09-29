import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("08-api-design");

export default function Layout({ children }: LayoutProps<"/lessons/08-api-design">) {
  return children;
}
