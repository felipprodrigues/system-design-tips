import { groups } from "@/lib/lessons";
import { GroupCard, MethodCard, TopicTracks, Hero } from "@/components";

export default function Home() {
  const [onRamp, ...topics] = groups;

  return (
    <>
      <Hero eyebrow="Course" title="System Design Roadmap">
        Concepts in the order you actually need them, from a single request to a system
        that serves millions.
      </Hero>

      <MethodCard />
      <GroupCard group={onRamp} />
      <TopicTracks groups={topics} />
    </>
  );
}
