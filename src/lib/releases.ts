/** Something that shipped and is worth telling a returning reader about. */
export interface Release {
  /** Doubles as the announcement's identity: the localStorage key is derived from
      it, so a new href is a new notice and there is no key to remember to bump. */
  href: string;
  title: string;
  body: string;
}

/* Append-only, newest LAST — the same shape as the concept entries, so shipping
   is one push to the end of one list. Only the final entry is ever announced:
   nothing here needs pruning, and a reader never meets a backlog of toasts. */
export const releases: Release[] = [
  {
    href: "/concepts/backend-around-one-message",
    title: "System Design 101 has a second capstone",
    body: "Follow one chat message end to end and watch a backend assemble around it, one piece at a time.",
  },
  {
    href: "/interview-qa",
    title: "Frontend interview Q&A",
    body: "57 questions on JavaScript, React and performance, each answered in full. Star the ones you want to come back to.",
  },
  {
    href: "/frontend",
    title: "Frontend System Design 101",
    body: "A 9-step walkthrough to frontend system design: rendering strategy, state ownership, the eight UI states and the reconnect path, in the order you meet them.",
  },
];

export const latestRelease = releases[releases.length - 1];
