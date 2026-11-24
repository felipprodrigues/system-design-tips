import type { Meta, StoryObj } from "@storybook/react-vite";
import { tokensIn, readToken, type TokenDoc } from "./tokens";
import styles from "./Foundations.module.css";

const GROUPS: (Pick<TokenDoc, "group"> & { title: string })[] = [
  { group: "surface", title: "Surfaces and borders" },
  { group: "text", title: "Text" },
  { group: "brand", title: "Brand" },
  { group: "diagram", title: "Diagram hues (blue family; the names are historical)" },
  { group: "status", title: "Status" },
  { group: "destination", title: "Destination hues" },
];

function Swatches({ group }: Pick<TokenDoc, "group">) {
  return (
    <div className={styles.grid}>
      {tokensIn(group).map((token) => (
        <div key={token.name} className={styles.swatch}>
          <div className={styles.chip} style={{ background: `var(${token.name})` }} />
          <div className={styles.meta}>
            <span className={styles.name}>{token.name}</span>
            <span className={styles.value}>{readToken(token.name)}</span>
            <span className={styles.usage}>{token.usage}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Palette() {
  return (
    <div className={styles.page}>
      {GROUPS.map(({ group, title }) => (
        <section key={group}>
          <h2 className={styles.groupTitle}>{title}</h2>
          <Swatches group={group} />
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: "Design System/Foundations/Colors",
  component: Palette,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Palette>;

export default meta;

export const Palette_: StoryObj<typeof meta> = { name: "Palette" };
