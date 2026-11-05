import { readFileSync } from "node:fs";
import { join } from "node:path";
import Dashboard from "@/components/Dashboard/Dashboard";
import { parseSections } from "@/lib/interviewPrep";

export default function Home() {
  // Counted here, not in Dashboard — that one is a client component.
  const questionCount = parseSections(
    readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
  ).length;

  return <Dashboard questionCount={questionCount} />;
}
