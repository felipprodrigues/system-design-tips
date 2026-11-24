import type { Meta, StoryObj } from "@storybook/react-vite";
import QuizCarousel from "@/components/Carousel/QuizCarousel";
import { QuizSection } from "./QuizSection";

const meta = {
  title: "Design System/Patterns/QuizSection",
  component: QuizSection,
  render: (args) => (
    <QuizSection {...args}>
      <QuizCarousel
        cards={[
          {
            question: "What is the definition of vertical scaling?",
            answers: ["Upgrading the hardware of an existing server: more CPU cores, more RAM, faster storage."],
          },
          {
            question: "What are the benefits of horizontal scaling?",
            answers: ["Theoretically infinite capacity", "Built-in redundancy through multiple nodes"],
            note: "Horizontal scaling has higher operational complexity.",
          },
        ]}
      />
    </QuizSection>
  ),
} satisfies Meta<typeof QuizSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomHeading: Story = { args: { eyebrow: "Check yourself", title: "Five quick questions" } };
