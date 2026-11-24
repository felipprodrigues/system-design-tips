import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import AppShell from "@/components/Shell/AppShell";
import type { ConceptSlugProps } from "@/components/Concept/types";
import { announcementSeen, CONCEPT_SLUGS, ConceptPage, loadConcept, type ConceptPageProps } from "./pageFixtures";

function ConceptRoute({ slug, Body }: ConceptSlugProps & Partial<Pick<ConceptPageProps, "Body">>) {
  return <AppShell>{Body ? <ConceptPage slug={slug} Body={Body} /> : null}</AppShell>;
}

const meta = {
  title: "Pages/Concept",
  component: ConceptRoute,
  parameters: { layout: "fullscreen", localStorage: announcementSeen },
  args: { slug: "horizontal-vs-vertical-scaling" },
  argTypes: { slug: { control: "select", options: CONCEPT_SLUGS }, Body: { table: { disable: true } } },
  loaders: [async ({ args }) => ({ Body: await loadConcept(args.slug) })],
  render: (args, { loaded }) => <ConceptRoute slug={args.slug} Body={loaded.Body} />,
} satisfies Meta<typeof ConceptRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AnyConcept: Story = {
  parameters: { nextjs: { navigation: { pathname: "/concepts/horizontal-vs-vertical-scaling" } } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 1 })).toBeInTheDocument();
    await expect(canvasElement.querySelector(".sd-quiz")).not.toBeNull();
  },
};

export const Capstone: Story = {
  args: { slug: "scaling-a-photo-app" },
  parameters: { nextjs: { navigation: { pathname: "/concepts/scaling-a-photo-app" } } },
};
