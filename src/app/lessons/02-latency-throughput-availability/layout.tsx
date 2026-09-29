import { lessonMetadata } from "@/lib/seo";

export const metadata = lessonMetadata("02-latency-throughput-availability");

export default function Layout({ children }: LayoutProps<"/lessons/02-latency-throughput-availability">) {
  return children;
}
