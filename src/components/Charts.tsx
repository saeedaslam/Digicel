import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Asset } from "../lib/types";
import {
  SITES,
  STATUS_META,
  STATUS_ORDER,
  daysUntil,
  fmtDate,
} from "../lib/types";
import { Icon, type IconName } from "./icons";

function useMounted(delay = 120): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setM(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);
  return m;
}

function Panel({
  icon,
  title,
  right,
  children,
}: {
  icon: IconName;
  title: string;
  right?: string;
  children: ReactNode;
}) {
  return (
    <section className="ticked anim-rise border border-edge bg-panel">
      <header className="flex items-center justify-between border-b border-edge px-4 py-3">
        <h2 className="flex items-center gap-2 font-display text-[12px] font-semibold tracking-[0.18em] text-dim">
          <span className="text-flare">
            <Icon name={icon} size={14} />
          </span>
          {title}
        </h2>
        {right && (
          <span className="font-mono text-[10px] tracking-[0.14em] text-faint">{right}</span>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

/* ---------------- status donut ---------------- */

function StatusDonut({ assets }: { assets: Asset[] }) {
  const mounted = useMounted();
  const size = 168;
  const stroke = 20;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const total = assets.length;

  const segments = useMemo(() => {
    let acc = 0;
    return STATUS_ORDER.map((st) => {
      const count = assets.filter((a) => a.status === st).length;
      const len = total ? (count / total) * C : 0;
      const seg = { st, count, len, acc };
      acc += len;
      return seg;
    }).filter((s) => s.count > 0);
  }, [assets, total, C]);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#15213a"
            strokeWidth={stroke}
          />
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {segments.map((s) => (
              <circle
                key={s.st}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={STATUS_META[s.st].color}
                strokeWidth={stroke}
                strokeDasharray={`${Math.max(s.len - 2.5, 0.6)} ${C}`}
                strokeDashoffset={mounted ? -s.acc : C}
                style={{
                  transition:
                    "stroke-dashoffset 1s cubic-bezier(0.25,0.7,0.25,1)",
                }}
              />
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold tabular-nums text-paper">
            {total}
          </span>
          <span className="font-mono text-[9px] tracking-[0.28em] text-faint">UNITS</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {STATUS_ORDER.map((st) => {
          const count = assets.filter((a) => a.status === st).length;
          const meta = STATUS_META[st];
          return (
            <li key={st} className="flex items-center gap-2 text-[12px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}88` }}
              />
              <span className="truncate text-dim">{meta.label}</span>
              <span className="ml-auto font-mono tabular-nums text-paper">{count}</span>
              <span className="w-9 text-right font-mono text-[10px] tabular-nums text-faint">
                {total ? Math.round((count / total) * 100) : 0}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- units per site ---------------- */

function SiteBars({ assets }: { assets: Asset[] }) {
  const mounted = useMounted(200);
  const rows = useMemo(() => {
    const per = SITES.map((site) => {
      const list = assets.filter((a) => a.site === site.code);
      return {
        site,
        total: list.length,
        svc: list.filter((a) => a.status === "IN_SERVICE").length,
      };
    });
    const max = Math.max(1, ...per.map((p) => p.total));
    return per.map((p) => ({ ...p, max }));
  }, [assets]);

  return (
    <ul className="space-y-2.5">
      {rows.map(({ site, total, svc, max }) => (
        <li key={site.code} className="group">
          <div className="mb-1 flex items-baseline justify-between text-[11px]">
            <span className="font-mono tracking-[0.12em] text-dim">
              <span className="text-paper">{site.code}</span>
              <span className="ml-2 text-faint">{site.name}</span>
            </span>
            <span className="font-mono tabular-nums text-faint">
              <span className="text-ok">{svc}</span> / {total}
            </span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden bg-raise">
            <div
              className="h-full bg-ok transition-[width] duration-700 ease-out"
              style={{ width: mounted ? `${(svc / max) * 100}%` : "0%" }}
            />
            <div
              className="h-full bg-edge2 transition-[width] duration-700 ease-out"
              style={{ width: mounted ? `${((total - svc) / max) * 100}%` : "0%" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- warranty watch ---------------- */

function WarrantyWatch({
  assets,
  onSelect,
}: {
  assets: Asset[];
  onSelect: (id: string) => void;
}) {
  const due = useMemo(
    () =>
      assets
        .map((a) => ({ a, days: daysUntil(a.warranty) }))
        .filter((x) => x.days <= 120)
        .sort((x, y) => x.days - y.days)
        .slice(0, 5),
    [assets]
  );

  if (due.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="text-ok">
          <Icon name="check" size={22} />
        </span>
        <p className="text-[12px] text-dim">No warranty expiries in the next 120 days.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {due.map(({ a, days }) => {
        const expired = days < 0;
        const color = expired || days <= 30 ? "#f2635c" : days <= 90 ? "#f2b33d" : "#93a5c4";
        return (
          <li key={a.id}>
            <button
              onClick={() => onSelect(a.id)}
              className="group flex w-full items-center gap-3 border border-transparent bg-panel2/60 px-3 py-2 text-left transition-all hover:border-edge2 hover:bg-panel2"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[11px] text-paper">
                  {a.serial}
                </span>
                <span className="block truncate text-[10px] text-faint">
                  {a.site} · expires {fmtDate(a.warranty)}
                </span>
              </span>
              <span
                className="shrink-0 border px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums tracking-wide"
                style={{
                  color,
                  borderColor: color + "55",
                  background: color + "12",
                }}
              >
                {expired ? "EXPIRED" : `${days}D LEFT`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function AnalyticsPanels({
  assets,
  onSelect,
}: {
  assets: Asset[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Panel icon="radar" title="FLEET BY STATUS" right="LIVE">
        <StatusDonut assets={assets} />
      </Panel>
      <Panel icon="pin" title="UNITS PER SITE" right={`${SITES.length} SITES`}>
        <SiteBars assets={assets} />
      </Panel>
      <Panel icon="shield" title="WARRANTY WATCH" right="≤ 120 DAYS">
        <WarrantyWatch assets={assets} onSelect={onSelect} />
      </Panel>
    </div>
  );
}
