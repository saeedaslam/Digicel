import type { Asset } from "../lib/types";
import { STATUS_META, daysUntil, fmtDate, siteByCode } from "../lib/types";
import { Icon } from "./icons";

export type SortKey =
  | "serial"
  | "description"
  | "category"
  | "site"
  | "status"
  | "installed"
  | "warranty";

export interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

interface Props {
  rows: Asset[];
  sort: SortState;
  onSort: (key: SortKey) => void;
  onSelect: (id: string) => void;
  onEdit: (a: Asset) => void;
  onDelete: (a: Asset) => void;
  emptyKind: "all" | "filtered" | null;
  onClearFilters: () => void;
  onAddFirst: () => void;
  onRestoreDemo: () => void;
}

const HEADERS: { key: SortKey; label: string; className?: string }[] = [
  { key: "status", label: "STATUS" },
  { key: "serial", label: "SERIAL №" },
  { key: "description", label: "DESCRIPTION" },
  { key: "category", label: "CATEGORY" },
  { key: "site", label: "SITE" },
  { key: "installed", label: "INSTALLED" },
  { key: "warranty", label: "WARRANTY" },
];

function WarrantyCell({ date }: { date: string }) {
  const d = daysUntil(date);
  const expired = d < 0;
  const color = expired || d <= 30 ? "#f2635c" : d <= 90 ? "#f2b33d" : "#5f7398";
  return (
    <div className="leading-tight">
      <p className="font-mono text-[11px] text-dim">{fmtDate(date)}</p>
      <p
        className="mt-0.5 inline-block border px-1.5 py-px font-mono text-[9px] font-semibold tracking-[0.08em]"
        style={{ color, borderColor: color + "55", background: color + "10" }}
      >
        {expired ? "EXPIRED" : d <= 90 ? `${d}D LEFT` : `+${d}D`}
      </p>
    </div>
  );
}

function RowActions({
  a,
  onSelect,
  onEdit,
  onDelete,
}: {
  a: Asset;
  onSelect: (id: string) => void;
  onEdit: (a: Asset) => void;
  onDelete: (a: Asset) => void;
}) {
  const btn =
    "flex h-7 w-7 items-center justify-center border border-transparent text-faint transition-all hover:border-edge2 hover:text-paper active:translate-y-px";
  return (
    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      <button className={btn} title="View details" aria-label={`View ${a.serial}`} onClick={(e) => { e.stopPropagation(); onSelect(a.id); }}>
        <Icon name="eye" size={14} />
      </button>
      <button className={btn} title="Edit unit" aria-label={`Edit ${a.serial}`} onClick={(e) => { e.stopPropagation(); onEdit(a); }}>
        <Icon name="edit" size={14} />
      </button>
      <button
        className="flex h-7 w-7 items-center justify-center border border-transparent text-faint transition-all hover:border-bad/60 hover:text-bad active:translate-y-px"
        title="Remove unit"
        aria-label={`Remove ${a.serial}`}
        onClick={(e) => { e.stopPropagation(); onDelete(a); }}
      >
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

export function AssetTable(p: Props) {
  if (p.emptyKind === "all") {
    return (
      <div className="anim-fade flex flex-col items-center gap-3 border border-edge bg-panel px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center border border-edge2 text-faint">
          <Icon name="server" size={26} />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold tracking-wide text-paper">
            INVENTORY EMPTY
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-dim">
            No charging-system units are registered. Add your first unit, or restore
            the demo fleet to explore the console.
          </p>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={p.onAddFirst}
            className="flex h-9 items-center gap-2 bg-flare px-4 text-xs font-bold tracking-wide text-white transition-all hover:bg-flare2 active:translate-y-px"
          >
            <Icon name="plus" size={14} /> REGISTER UNIT
          </button>
          <button
            onClick={p.onRestoreDemo}
            className="flex h-9 items-center gap-2 border border-edge bg-panel2 px-4 text-xs font-semibold tracking-wide text-dim transition-all hover:border-edge2 hover:text-paper active:translate-y-px"
          >
            <Icon name="rotate" size={14} /> RESTORE DEMO FLEET
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="ticked anim-rise border border-edge bg-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead>
            <tr className="border-b border-edge bg-panel2/60">
              {HEADERS.map((h) => {
                const activeSort = p.sort.key === h.key;
                return (
                  <th key={h.key} className="px-4 py-2.5 font-normal">
                    <button
                      onClick={() => p.onSort(h.key)}
                      className={`flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] transition-colors ${
                        activeSort ? "text-signal" : "text-faint hover:text-dim"
                      }`}
                    >
                      {h.label}
                      {activeSort && (
                        <Icon name={p.sort.dir === "asc" ? "arrowUp" : "arrowDown"} size={11} />
                      )}
                    </button>
                  </th>
                );
              })}
              <th className="px-4 py-2.5 text-right font-mono text-[10px] tracking-[0.18em] text-faint">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {p.rows.map((a, i) => {
              const meta = STATUS_META[a.status];
              const site = siteByCode(a.site);
              return (
                <tr
                  key={a.id}
                  onClick={() => p.onSelect(a.id)}
                  className="anim-rise group cursor-pointer border-b border-edge/60 transition-colors last:border-0 hover:bg-panel2/70"
                  style={{ animationDelay: `${Math.min(i, 14) * 28}ms` }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-2 border px-2 py-1 font-display text-[10px] font-semibold tracking-[0.1em]"
                      style={{
                        color: meta.color,
                        borderColor: meta.color + "44",
                        background: meta.soft,
                      }}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${a.status === "IN_SERVICE" ? "led-pulse" : ""}`}
                        style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
                      />
                      {meta.label.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] font-medium text-paper">
                    {a.serial}
                  </td>
                  <td className="max-w-[260px] px-4 py-3">
                    <p className="truncate text-[13px] text-paper/90">{a.description}</p>
                    {a.notes && (
                      <p className="truncate text-[10px] text-faint">{a.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="border border-edge bg-panel2 px-2 py-0.5 text-[10px] font-medium tracking-wide text-dim">
                      {a.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[12px] font-semibold text-signal">{a.site}</p>
                    <p className="text-[10px] text-faint">
                      {site ? `${site.name}, ${site.country}` : a.site}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-dim">{fmtDate(a.installed)}</td>
                  <td className="px-4 py-3">
                    <WarrantyCell date={a.warranty} />
                  </td>
                  <td className="px-4 py-3">
                    <RowActions a={a} onSelect={p.onSelect} onEdit={p.onEdit} onDelete={p.onDelete} />
                  </td>
                </tr>
              );
            })}
            {p.emptyKind === "filtered" && (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                    <span className="text-faint">
                      <Icon name="filter" size={24} />
                    </span>
                    <p className="text-[13px] text-dim">
                      No units match the current search &amp; filters.
                    </p>
                    <button
                      onClick={p.onClearFilters}
                      className="flex h-8 items-center gap-2 border border-edge bg-panel2 px-3 font-display text-[10px] font-semibold tracking-[0.14em] text-dim transition-all hover:border-edge2 hover:text-paper active:translate-y-px"
                    >
                      <Icon name="rotate" size={12} /> CLEAR FILTERS
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
