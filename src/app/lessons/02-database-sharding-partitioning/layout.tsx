import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("02-database-sharding-partitioning");

export default function Layout({ children }: LayoutProps<"/lessons/02-database-sharding-partitioning">) {
  return children;
}
