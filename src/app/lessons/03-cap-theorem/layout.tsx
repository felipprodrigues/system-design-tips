import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("03-cap-theorem");

export default function Layout({ children }: LayoutProps<"/lessons/03-cap-theorem">) {
  return children;
}
