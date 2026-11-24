# Design system

One source of truth for how System Design Bits looks, extracted from what the pages
already do. Nothing was moved or deleted to build it: every page still renders exactly
as before, and moving pages onto these components is the next iteration.

```tsx
import { Section, Prose, Callout, Figure, Diagram, QuizSection, QuizCarousel } from "@/design-system";
```

## Layers

| Layer | Lives in | What it is |
| --- | --- | --- |
| Tokens | `src/styles/tokens.css` | Every colour, font, measure and radius, with the light-mode override. The only place a value is defined. |
| Shared classes | `src/styles/concept.css`, `base.css` | The `sd-*` classes concept bodies use. Still live, and the components below render them. |
| Primitives | `primitives/` | `Eyebrow` `Heading` `Text` `Strong` `Highlight` `Prose` `Card` `Callout` `PanelNote` `Figure` `Badge` `Chip` `ChipGroup` `Button` `buttonStyles` `IconButton` `NumberBadge` `DataTable` `ProgressBar` |
| Patterns | `patterns/` | `Section` `QuizSection` `PullQuote` `DefinitionList` `NumberedItem` `DotList` `ComparisonCard` `Versus` `Banner` |
| Diagram | `diagram/` | `Diagram` `ArrowMarker` `DiagramNode` `DiagramEdge` `Lifelines` `Message` |
| Re-exports | `index.ts` | `Hero` `Breadcrumb` `PageNav` `PageLayout` `ConceptLayout` `QuizCarousel` `SidePanel` `PanelSection` `MarkerList` `Term` `DeepDiveButton` `ThemeToggle` `ProgressRing`, still in `src/components` |

Feature components that read app data (`Dashboard`, `PrepBrowser`, `CaseStudyBrowser`,
`ConceptRail`, `AppShell`…) are not part of the design system; they are in Storybook
under **Features** so they can be migrated onto it.

## Rules the components follow

- **A wrapper renders the legacy class, not a copy of it.** `<Callout tone="accent">` is
  `<div class="sd-callout sd-callout-accent">`, byte for byte (the unit tests assert the
  markup). Migrating a call site cannot change a pixel, and `concept.css` stays the
  single definition for both old and new code.
- **Colour is a typed `tone`, never a string.** `tone="teal"` sets `--ds-tone` and
  `--ds-tone-wash` from the token. Tones with a wash token use it; the rest mix one at
  12%, which is the dark-mode value of the `rgba()` literals it replaces. Unlike those
  literals, it follows light mode.
- **Framework-free.** Nothing imports Next. Links take `linkAs={Link}` (`Banner`) or
  spread `buttonStyles()` onto `<Link>`.
- **Server-safe.** No hooks, no `window`. `server.test.tsx` renders every component
  with no DOM, so they can be used from Server Components without `"use client"`.
- **CSS Modules for new CSS, tokens for every value.** New rules that sit on a legacy
  class use a compound selector (`:global(.sd-callout).toned`) so they win on
  specificity, not on stylesheet order.

## Where types live

A type lives with the highest module that owns its meaning, and no higher. If only one
file uses it, it stays in that file.

| Kind of type | Home | Examples |
| --- | --- | --- |
| Domain data | its `src/lib` module | `ConceptEntry`, `ConceptGroup<C>`, `PrepSection`, `PrepLink`, `Tally`, `ReadingMinutes`, `Status` |
| Design-system vocabulary | `src/design-system/types.ts`, `tone.ts`, `diagram/types.ts` | `Tone`, `Toned`, `TextTag`, `DiagramColor`, `Point`, `Rect` |
| A component's data contract | exported by that component | `QuizCard`, `Definition`, `Lane`, `DiagramNodeProps`, `ColorScheme` |
| Authored content shared across scopes | `src/types/content.ts` | `Hue`, `TitledText`, `FlowStep`, `CompareColumn`, `ExampledColumn` |
| Shared by concept bodies only | `src/concepts/types.ts` | `BoxProps`, `StagedNode`, `CapstoneStage`, `NamedStep`, `FurtherReading` |
| One route or folder | that folder | `Phase`, `Stage` (frontend), `Finding`, `FindingLinks` (LinkedIn), `ConceptSlugProps` |

- **Derive, don't restate.** `PrepLink` is `Pick<PrepSection, ...>`, `PageNavProps` extends
  `ConceptNav`, and a capstone `dive` is `Pick<ConceptEntry, "slug" | "title">`, so a change
  to the source type reaches every use.
- **Check authored arrays with `satisfies`, not an annotation.** `const terms = [...]
  satisfies Definition[]` rejects a misspelled key but keeps the literal types that
  `key={t.title}` needs.
- **Type-only imports are `import type { ... }` statements.** `npm test` runs
  `src/lib/*` and `src/app/frontend/data.ts` directly in Node, which erases those
  statements entirely but cannot resolve `@/` or a type imported as a value.
- `src/concepts/types.ts` is safe there because only `.tsx` files are concepts. Anything
  else in that folder must not be `.tsx`.

## Storybook

```bash
npm run storybook        # http://localhost:6006
npm run build-storybook  # static build in storybook-static/
```

Sidebar: **Design System** (Introduction, Foundations, Primitives, Patterns, Diagram),
**Components** (existing shared components), **Features** (data-bound components),
**Pages** (every route, composed inside the real `AppShell`, and a picker for any concept).

- **Theme** toolbar sets `<html data-theme>`, the same attribute `ThemeToggle` writes.
- `next/link`, `next/image` and `next/navigation` are aliased to stand-ins in
  `.storybook/mocks` (in `vite.config.ts`, so Vitest gets them too).
- Story parameters:
  - `nextjs: { navigation: { pathname: "/concepts/cap-theorem" } }` — what `usePathname()` returns.
    Same shape as `@storybook/nextjs-vite`, so stories survive a framework switch.
  - `localStorage: { "sd-completed": ["cap-theorem"] }` — seeded before render; progress
    stores re-read it. Parameters deep-merge, so a story unsets a meta key with `null`.
- Fonts: `next/font` does not exist outside Next, so `.storybook/preview-head.html`
  loads the same three families from Google Fonts and defines the same variables.

## Quality gates

`npm run check` runs all three, and CI runs each before the build.

| Script | What it enforces |
| --- | --- |
| `npm run lint` | ESLint with `--max-warnings=0`, so nothing is a soft warning. |
| `npm run typecheck` | Route types (`next typegen`), exact CSS-module types, then `tsc -p tsconfig.typecheck.json` over every `.ts`/`.tsx` in `src/app` and `src/design-system`, tests and stories included. |
| `npm test` | The data checks, the read-time check and every Vitest file. |

Lint rules that carry a decision, not a style:

- **`src/design-system` stays framework-free**: no `next/*`, `@/app`, `@/concepts`,
  `@/stories` or `@/lib` imports outside stories and tests.
- **`src/app` builds from the design system**: shared UI from `@/design-system` (not
  `@/components`), no `sd-*` class that has a component, no hand-written `<marker>`.
- **`import type` statements** wherever only types are imported: Node runs some of
  these files directly and would otherwise resolve the import at runtime.
- Unused code, hook dependencies, `===`, and the accessibility rules are errors.

`typecheck` adds `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`,
`noImplicitOverride`, `noFallthroughCasesInSwitch` and no unreachable code or unused
labels. CSS modules get exact types from `scripts/css-module-types.mjs` (written to the
gitignored `.typegen/` and overlaid with `rootDirs`), so `styles.bannr`, or a variant with
no class of its own, is a type error. `noUncheckedIndexedAccess` is not on: it needs 95
code changes first.

## Tests

`npm test` runs everything CI runs. Added to it:

| File | What it guarantees |
| --- | --- |
| `src/stories.test.tsx` | Every story in `src/` renders in jsdom and its `play` function passes. Fails on a thrown render, a failed assertion, or any React `console.error` (missing key, bad prop). |
| `*/Component.test.tsx` | Markup parity with the legacy classes, tones, a11y contracts (accessible names, `aria-pressed`, `type="button"`, progressbar values). |
| `server.test.tsx` | Every component renders with no DOM. |
| `foundations/*.test.tsx` | Every token in `tokens.css` and every `sd-*` class is documented in Storybook, and nothing stale is. |
| `src/stories/concepts.test.tsx` | All 16 concept bodies render inside the route chrome with their index title and quiz. The safety net for migrating them. |

Write interactions as `play` functions in the story; the story runner asserts them in
CI, and Storybook shows them step by step in the Interactions panel. Keep a story's
name true to the state its `play` leaves it in.

Page tests live next to the page (`src/app/**/X.test.tsx`) and use `src/test/appTestUtils`:
`atRoute()` sets the mocked pathname and the URL, and `renderWithStorage()` seeds
localStorage and then fires the `storage` event the progress stores need to drop
their module-level cache. Mock `node:fs` or `./data` to reach edge cases; never change
a component to suit a test. A known bug is recorded as `test.fails` asserting the
intended behaviour, so fixing it turns the test red until it is made a normal test.

## Migration map

Every page under `src/app` is migrated: the walkthrough, Frontend 101, LinkedIn Skills
and the `(index)` pages build from `@/design-system`, and only the feature components
(`Dashboard`, `PrepBrowser`, `CaseStudyBrowser`, `LearnedToggle`, `AppShell`,
`ConceptRail`) still come from `@/components`. What remains is the 16 concept bodies
in `src/concepts` and the feature components themselves.

Counts are from the audit of `src/concepts`, `src/app` and `src/components`.

| Today | Replace with | Where |
| --- | --- | --- |
| `<div className="sd-section"><p className="sd-eyebrow">…<h2 className="sd-h2">` | `<Section eyebrow title>` | 192 headings, 19 files |
| `sd-quiz` + `sd-eyebrow-accent` + `sd-quiz-title` | `<QuizSection>` | 18 files |
| `<div className="sd-prose" style={{ fontSize: 16 }}>` | `<Prose size="lg">` | 13 files (every Big Idea) |
| `<p style={{ marginTop: 12 }}>` between paragraphs | nothing: `Prose` spaces paragraphs | 28 |
| Inline callout `borderRadius: 0, padding: "14px 18px"` | `<Callout tone>` | 21, 7 files |
| Table wrapper + inline `th`/`td` styles | `<DataTable columns rows density>` | 26 wrappers, 18 files |
| Inline uppercase tag `padding: "2px 8px"` | `<Badge tone>` | 13, 7 files |
| Round number / sign circle | `<NumberBadge size tone>` | 12, 9 files |
| `<blockquote style={{ borderLeft: … }}>` | `<PullQuote>` | 9, 9 files |
| `sd-card` + teal title + `sd-text-sm-tight` | `<DefinitionList items>` | 12, 10 files |
| Local `PItem` | `<NumberedItem>` | horizontal-vs-vertical-scaling |
| `ModeCard`, `BucketCard`, strategy cards | `<ComparisonCard>` | 11 |
| `gridTemplateColumns: "1fr auto 1fr"` + VS | `<Versus>` | 5 files |
| `<marker>` arrowhead | `<ArrowMarker id color>` | 18, 12 files, all identical |
| `<svg style={{ width: "100%", minWidth, display: "block" }}>` | `<Diagram>` in `<Figure scroll>` | 32, 13 files |
| Local `Node` / `Edge` | `<DiagramNode>` / `<DiagramEdge>` | CDN, rate limiting, LinkedIn |
| Local `Lifelines` / `Msg` | `<Lifelines>` / `<Message>` | caching, photo app, backend capstone |
| Dashboard `.banner` | `<Banner tone linkAs={Link}>` | Dashboard |
| `.chip` in CaseStudyBrowser and PrepBrowser | `<Chip>` / `<ChipGroup>` | 2 copies |
| `.close` / `.toastClose` / ThemeToggle `.btn` | `<IconButton variant>` | 3 implementations |
| PageNav / QuizCarousel `.btn`, Dashboard `.button`, Prep `.stepper`, toast primary | `<Button variant>` / `buttonStyles()` | 5 |
| Dashboard `.bar` | `<ProgressBar>` | Dashboard |
| `rgba(76, 110, 245, 0.15)` and 119 other literals | a `tone` prop | 120, 18 files |

Suggested order: `Section` and `QuizSection` first (mechanical, largest), then callouts,
tables and badges, then diagrams one concept at a time. `src/stories/concepts.test.tsx`
and the **Pages** stories are the before/after check for each.

## Drift found during the audit

Left as it is (nothing was changed in the pages), but each decision below is made in
the component, so migrating resolves it:

- **Dark-only tints.** The `rgba()` literals are the dark-mode values of `--sd-accent`,
  `--sd-teal`, `--sd-green`, `--sd-amber` and `--sd-red`. Light mode redefines those
  tokens, so today the tints stay dark-palette in light mode. `tone` fixes this.
- **A retired palette.** The walkthrough's step washes `rgba(56,178,172)`,
  `rgba(72,187,120)` and `rgba(214,158,46)` match no token. They are an older teal,
  green and amber.
- **Two chips that disagree.** Pressed background is a 0.10 literal in
  `CaseStudyBrowser` and `--sd-accent-wash` (0.12 in dark) in `PrepBrowser`; the count
  is accent in one and 75% opacity in the other. `Chip` uses the token and the opacity.
- **27 eyebrow clones.** Module CSS has 27 mono, uppercase label rules with small
  differences in size (9.5–12px) and tracking (0.04–0.16em). `Eyebrow` has three.
- **Ghost button padding** is `9px 16px` (PageNav), `8px 18px` (QuizCarousel) and
  `6px 13px` (DeepDiveButton). `Button variant="ghost"` is `8px 16px`.
- **Radii** in use: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16 and 999px. There are now tokens
  for 4, 8, 10, 12, 16 and 999; new CSS uses only those.
- **One styled-jsx block** (`relational-vs-nosql.tsx`, a card hover). It is the only
  use of a second styling system, and Vite cannot compile it, so it renders unscoped
  in Storybook. Replace it with a CSS Module when that concept migrates.
- **An ad-hoc term.** horizontal-vs-vertical-scaling styles "stateless" like `Term`
  but uses a `title` attribute, so it has no keyboard access and no card.
- **Tailwind and shadcn are installed but unused for styling.** No TSX uses a utility
  class and `components/ui/button.tsx` has no callers. Tailwind's preflight *is* the
  CSS reset in effect, so removing it is not free.
- **The quiz title is a `<p>`.** `QuizSection` keeps it for parity; making it a heading
  also changes its font (`base.css` sets `h2` to the display face).

## Gotchas

- **Never put a story, test or other `.tsx` file in `src/concepts/`.** `scripts/read-time.mjs`
  treats every `.tsx` there as a concept and `npm test` fails on the stale read-time map.
  Concept stories and tests live in `src/stories/`; shared concept types in `types.ts`.
- **Marker ids are document-global.** Two diagrams on one page need two `ArrowMarker` ids.
- **Every named export of a `.stories.tsx` is a story.** Shared fixtures go in a plain
  module (`src/stories/pageFixtures.tsx`).
