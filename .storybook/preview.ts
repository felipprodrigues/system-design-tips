import type { Preview } from "@storybook/react-vite";
import "../src/app/globals.css";
import { withLocalStorage, withNextNavigation, withTheme } from "./decorators";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    layout: "padded",
    options: {
      storySort: {
        order: [
          "Design System",
          ["Introduction", "Foundations", "Primitives", "Patterns", "Diagram"],
          "Components",
          "Features",
          "Pages",
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Mirrors <html data-theme>, the attribute ThemeToggle writes",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "dark" },
  decorators: [withLocalStorage, withNextNavigation, withTheme],
};

export default preview;
