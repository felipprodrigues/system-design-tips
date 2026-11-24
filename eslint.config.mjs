import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const DS_PROVIDED = [
  "Hero",
  "Breadcrumb",
  "PageNav",
  "PageLayout",
  "QuizCarousel",
  "QuizCard",
  "SidePanel",
  "PanelSection",
  "MarkerList",
  "Term",
  "DeepDiveButton",
  "ThemeToggle",
];

const LEGACY_CLASS =
  "/(^|\\s)sd-(section|prose|callout|callout-accent|callout-green|card|panel-card|panel-card-title|panel-note|eyebrow|eyebrow-accent|eyebrow-sub|h1|h2|lede|quiz|quiz-title|text-sm|text-sm-tight|text-xs|hl|hl-accent|hl-amber|hl-muted|strong|figure)(\\s|$)/";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // npm test runs src/lib and frontend/data.ts in Node, which erases an
      // `import type` statement but resolves `import { type X }` at runtime.
      "@typescript-eslint/no-import-type-side-effects": "error",
      "react-hooks/exhaustive-deps": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "import/no-duplicates": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "react/jsx-key": "error",
      "react/jsx-no-target-blank": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/no-unknown-property": ["error", { ignore: ["jsx"] }],
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/tabindex-no-positive": "error",
      "jsx-a11y/no-autofocus": "error",
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/design-system/**/*.{ts,tsx}"],
    ignores: ["**/*.test.tsx"],
    rules: {
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": ["error", { components: ["Link"] }],
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    },
  },
  {
    files: ["src/design-system/**/*.{ts,tsx}"],
    ignores: ["**/*.stories.tsx", "**/*.test.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*"],
              message: "The design system is framework-free. Take a linkAs prop or spread buttonStyles() instead.",
            },
            {
              group: ["@/app/*", "@/concepts/*", "@/stories/*", "@/lib/*"],
              message: "The design system must not depend on pages, concepts or app data.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    ignores: ["**/*.test.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components",
              importNames: DS_PROVIDED,
              message: "Import shared UI from @/design-system. @/components is for feature components only.",
            },
          ],
          patterns: [
            {
              group: [
                "@/components/Layout/*",
                "@/components/Carousel/*",
                "@/components/SidePanel/*",
                "@/components/MarkerList/*",
                "@/components/Term/*",
                "@/components/Button/*",
                "@/components/ThemeToggle/*",
                "@/components/Concept/ConceptLayout",
                "@/components/Dashboard/ProgressRing",
              ],
              message: "Import shared UI from @/design-system.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: `JSXOpeningElement[name.name=/^(div|p|span|strong|h1|h2|h3)$/] > JSXAttribute[name.name='className'] > Literal[value=${LEGACY_CLASS}]`,
          message:
            "This sd-* class has a design-system component (src/design-system/README.md, Migration map). Use it from @/design-system.",
        },
        {
          selector: "JSXOpeningElement[name.name='marker']",
          message: "Use <ArrowMarker> from @/design-system.",
        },
      ],
    },
  },
  {
    files: ["src/lib/*.test.ts", "scripts/**"],
    rules: { "no-console": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "storybook-static/**", "next-env.d.ts"]),
]);

export default eslintConfig;
