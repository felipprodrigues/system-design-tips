import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import QuizCarousel from "./QuizCarousel";

const meta = {
  title: "Components/QuizCarousel",
  component: QuizCarousel,
  args: {
    cards: [
      {
        question: "Why can't you just add more servers to scale a system that stores sessions in server memory?",
        answers: ["Because a session in one server's memory only exists on that server."],
      },
      {
        question: "What are the benefits of horizontal scaling?",
        answers: ["Theoretically infinite capacity", "Built-in redundancy through multiple nodes"],
        note: "Horizontal scaling has higher operational complexity.",
      },
      {
        question: "What causes the ceiling in vertical scaling?",
        answers: ["The physical limits of hardware."],
      },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: "var(--sd-page-max)" }}>
      <QuizCarousel {...args} />
    </div>
  ),
} satisfies Meta<typeof QuizCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Navigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole("button", { name: /Prev/ });
    const next = canvas.getByRole("button", { name: /Next/ });

    await expect(canvas.getByText("Question 1 of 3")).toBeInTheDocument();
    await expect(prev).toBeDisabled();

    await userEvent.click(next);
    await expect(canvas.getByText("Question 2 of 3")).toBeInTheDocument();
    await expect(canvas.getByText(/higher operational complexity/)).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Go to question 3" }));
    await expect(canvas.getByText("Question 3 of 3")).toBeInTheDocument();
    await expect(next).toBeDisabled();
  },
};
