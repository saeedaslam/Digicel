import type { Category, Status } from "../lib/types";
import { CATEGORIES, SITES, STATUS_META, STATUS_ORDER } from "../lib/types";
import { Icon } from "./icons";

export type StatusFilter = Status | "ALL";

interface Props {
  query: string;
  onQuery: (v: string) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  category: string;
  onCategory: (v: string) => void;
  site: string;
  onSite: (v: string) => void;
  counts: Record<Status, number>;
  total: number;
  shown: number;
  onClear: () => void;
  active: boolean;
}

export function FilterBar(p: Props) {
  const selectCls =
    "h-9 appearance-none border border-edge bg-panel2 pl-3 pr-8 text-xs font-medium text-dim transition-colors hover:border-edge2 focus:border-signal focus:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
          <Icon name="search" size={15} />
        </span>
        <input
          value={p.query}
          onChange={(e) => p.onQuery(e.target.value)}
          placeholder="Search serial, description, notes…"
          className="h-9 w-[250px] border border-edge bg-panel2 pl-9 pr-8 text-[13px] text-paper placeholder:text-faint transition-colors hover:border-edge2 focus:border-signal focus:outline-none"
        />
        {p.query && (
          <button
            onClick={() => p.onQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-paper"
          >
            <Icon name="x" size={13} />
          </button>
        )}
      </div>

      {/* status chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(
          [{ st: "ALL" as StatusFilter, label: "ALL", count: p.total },
           ...STATUS_ORDER.map((st) => ({
             st: st as StatusFilter,
             label: STATUS_META[st].label.toUpperCase(),
             count: p.counts[st],
           }))]
        ).map(({ st, label, count }) => {
          const activeChip = p.status === st;
          const color = st === "ALL" ? "#e9f0fb" : STATUS_META[st].color;
          return (
            <button
              key={st}
              onClick={() => p.onStatus(st)}
              className="flex h-8 items-center gap-1.5 border px-2.5 font-display text-[10px] font-semibold tracking-[0.12em] transition-all active:translate-y-px"
              style={
                activeChip
                  ? {
                      color,
                      borderColor: color + "88",
                      background: st === "ALL" ? "rgba(233,240,251,0.08)" : STATUS_META[st].soft,
                    }
                  : { color: "#93a5c4", borderColor: "#1b2946", background: "transparent" }
              }
            >
              {label}
              <span className="font-mono text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* category */}
        <div className="relative">
          <select
            value={p.category}
            onChange={(e) => p.onCategory(e.target.value)}
            className={selectCls}
            aria-label="Filter by category"
          >
            <option value="ALL">All categories</option>
            {CATEGORIES.map((c: Category) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint">
            <Icon name="chevronDown" size={13} />
          </span>
        </div>

        {/* site */}
        <div className="relative">
          <select
            value={p.site}
            onChange={(e) => p.onSite(e.target.value)}
            className={selectCls}
            aria-label="Filter by site"
          >
            <option value="ALL">All sites</option>
            {SITES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint">
            <Icon name="chevronDown" size={13} />
          </span>
        </div>

        <span className="hidden font-mono text-[10px] tabular-nums tracking-[0.12em] text-faint md:block">
          {p.shown}/{p.total} SHOWN
        </span>

        {p.active && (
          <button
            onClick={p.onClear}
            className="flex h-8 items-center gap-1.5 border border-flare/50 px-2.5 font-display text-[10px] font-semibold tracking-[0.12em] text-flare transition-all hover:bg-flare/10 active:translate-y-px"
          >
            <Icon name="rotate" size={12} />
            CLEAR
          </button>
        )}
      </div>
    </div>
  );
}
