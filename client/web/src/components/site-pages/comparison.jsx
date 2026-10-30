import { asArray, asObject, asText } from "@/lib/content/site-page-adapters";
import { BlockHead, BlockShell } from "./shared";

// columns: ["Option A", ...] or [{ text }]; rows: [{ label, values }] where
// values is a textarea (one cell per line) or a list of cells.
const columnsOf = (data) =>
  asArray(data.columns)
    .map((column) => asText(typeof column === "string" ? column : column?.text ?? column?.label ?? column?.title))
    .filter(Boolean);

const rowsOf = (data) =>
  asArray(data.rows)
    .map((row) => {
      const source = asObject(row);
      const cells = source.values ?? source.cells;
      return {
        label: asText(source.label),
        // keep empty lines inside a row so cells stay under their column
        cells: (Array.isArray(cells) ? cells.map((cell) => asText(cell?.text ?? cell)) : String(cells ?? "").split(/\r?\n/).map((line) => line.trim())),
      };
    })
    .filter((row) => row.label || row.cells.some(Boolean));

export function ComparisonBlock({ section, ctx }) {
  const data = section.data;
  const columns = columnsOf(data);
  const rows = rowsOf(data);
  const width = Math.max(columns.length, ...rows.map((row) => row.cells.length), 1);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const head = Array.from({ length: width }, (_, index) => columns[index] ?? "");
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BlockHead id={titleId} heading={heading} intro={asText(data.intro)} />
      <div
        role="region"
        tabIndex={0}
        aria-label={heading || section.label || ctx.tx("comparisonRegion", "Comparison table")}
        className="overflow-x-auto rounded-2xl border border-slate-200 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]"
      >
        <table className="w-full min-w-[34rem] border-collapse text-left text-[15px] leading-6 text-slate-700">
          <thead>
            <tr className="bg-[#e8efec] text-[#09263e]">
              <th scope="col" className="p-4 text-xs font-semibold uppercase tracking-[0.12em]">
                <span className="sr-only">{ctx.tx("comparisonRowHeader", "Aspect")}</span>
              </th>
              {head.map((column, index) => (
                <th key={index} scope="col" className="p-4 align-bottom text-sm font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-200 align-top">
                <th scope="row" className="w-[26%] p-4 text-sm font-semibold text-[#09263e]">
                  {row.label}
                </th>
                {Array.from({ length: width }, (_, cell) => (
                  <td key={cell} className="p-4">
                    {row.cells[cell]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlockShell>
  );
}

export const comparisonEmpty = (data) => rowsOf(data).length === 0;
