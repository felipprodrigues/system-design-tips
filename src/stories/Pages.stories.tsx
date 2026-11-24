import type { Meta, StoryObj } from "@storybook/react-vite";
import AboutPage from "@/app/(index)/about/page";
import CaseStudiesPage from "@/app/case-studies/page";
import IndexLayout from "@/app/(index)/layout";
import FrontendDesign from "@/app/frontend/FrontendDesign";
import PaginatedListSync from "@/app/linkedin-skills/PaginatedListSync";
import Walkthrough from "@/app/walkthrough/Walkthrough";
import { Hero, LearnedToggle, PrepBrowser } from "@/components";
import Dashboard from "@/components/Dashboard/Dashboard";
import AppShell from "@/components/Shell/AppShell";
import { announcementSeen, frontendDeeper, linkedInDeeper, prepSections } from "./pageFixtures";

const params = Promise.resolve({});

const meta = {
  title: "Pages/Site",
  component: AppShell,
  parameters: { layout: "fullscreen", localStorage: announcementSeen },
  args: { children: null },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Roadmap: Story = {
  parameters: { nextjs: { navigation: { pathname: "/" } } },
  render: () => (
    <AppShell>
      <IndexLayout params={params}>
        <Dashboard questionCount={prepSections.length} />
      </IndexLayout>
    </AppShell>
  ),
};

export const TheMethod: Story = {
  parameters: { nextjs: { navigation: { pathname: "/walkthrough" } } },
  render: () => (
    <AppShell>
      <Walkthrough />
    </AppShell>
  ),
};

export const CaseStudies: Story = {
  parameters: { nextjs: { navigation: { pathname: "/case-studies" } } },
  render: () => (
    <AppShell>
      <CaseStudiesPage />
    </AppShell>
  ),
};

export const InterviewQA: Story = {
  name: "Interview Q&A",
  parameters: { nextjs: { navigation: { pathname: "/interview-qa" } } },
  render: () => (
    <AppShell>
      <IndexLayout params={params}>
        <LearnedToggle />
        <Hero eyebrow="Interview Q&amp;A" title="Questions, answered">
          {prepSections.length} frontend interview questions, each written out the way you would actually say it in
          the room.
        </Hero>
        <PrepBrowser sections={prepSections} />
      </IndexLayout>
    </AppShell>
  ),
};

export const Frontend101: Story = {
  name: "Frontend 101",
  parameters: { nextjs: { navigation: { pathname: "/frontend" } } },
  render: () => (
    <AppShell>
      <FrontendDesign deeper={frontendDeeper} />
    </AppShell>
  ),
};

export const LinkedInSkills: Story = {
  name: "LinkedIn Skills",
  parameters: { nextjs: { navigation: { pathname: "/linkedin-skills" } } },
  render: () => (
    <AppShell>
      <PaginatedListSync deeper={linkedInDeeper} />
    </AppShell>
  ),
};

export const About: Story = {
  parameters: { nextjs: { navigation: { pathname: "/about" } } },
  render: () => (
    <AppShell>
      <IndexLayout params={params}>
        <AboutPage />
      </IndexLayout>
    </AppShell>
  ),
};
