import clsx from "clsx";
import type { ReactNode } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./DataTable.module.css";

export interface DataTableColumn extends Toned {
  header: ReactNode;
  emphasis?: boolean;
  mono?: boolean;
  nowrap?: boolean;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: ReactNode[][];
  density?: "comfortable" | "compact";
  caption?: string;
  className?: string;
}

export function DataTable({ columns, rows, density = "comfortable", caption, className }: DataTableProps) {
  return (
    <div className={clsx(styles.wrap, className)}>
      <table className={clsx(styles.table, density === "compact" && styles.compact)}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column, i) => (
              <th key={i} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                const column = columns[c] ?? {};
                return (
                  <td
                    key={c}
                    className={clsx(column.emphasis && styles.emphasis, column.mono && styles.mono, column.nowrap && styles.nowrap)}
                    style={toneVars(column.tone)}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
