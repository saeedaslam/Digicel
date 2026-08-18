import { useEffect, type ReactNode } from "react";
import type { Asset, Status } from "../lib/types";
import {
  STATUS_META,
  STATUS_ORDER,
  daysUntil,
  fmtDate,
  fmtStamp,
  siteByCode,
} from "../lib/types";
import { Icon } from "./icons";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border border-edge bg-panel2/50 px-3 py-2.5">
      <p className="font-mono text-[9px] tracking-[0.22em] text-faint">{label}</p>
      <div className="mt-1 text-[13px] text-paper">{children}</div>
    </div>
  );
}

export function AssetDrawer({
  asset,
  onClose,
  onEdit,
  onDelete,
  onStatus,
}: {
  asset: Asset | null;
  onClose: () => void;
  onEdit: (a: Asset) => void;
  onDelete: (a: Asset) => void;
  onStatus: (id: string, s: Status) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!asset) return null;

  const meta = STATUS_META[asset.status];
  const site = siteByCode(asset.site);
  const wDays = daysUntil(asset.warranty);
  const ageDays = -daysUntil(asset.installed);
  const wColor = wDays < 0 || wDays <= 30 ? "#f2635c" : wDays <= 90 ? "#f2b33d" : "#3ecf8e";

  return (
    <div className="fixed inset-0 z-50">
      <div className="anim-fade absolute inset-0 bg-abyss/75" onClick={onClose} />
      <aside
        key={asset.id}
        className="anim-drawer absolute right-0 top-0 flex h-full w-[min(94vw,440px)] flex-col border-l border-edge bg-panel shadow-[-24px_0_60px_rgba(0,0,0,0.5)]"
      >
        {/* header */}
        <div className="border-b border-edge" style={{ boxShadow: `inset 0 3px 0 ${meta.color}` }}>
          <div className="flex items-start justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] tracking-[0.22em] text-faint">UNIT RECORD</p>
              <h2 className="mt-1 truncate font-mono text-lg font-semibold text-paper">
                {asset.serial}
              </h2>
              <p className="mt-0.5 text-[13px] text-dim">{asset.description}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close details"
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-edge text-faint transition-colors hover:border-edge2 hover:text-paper"
            >
              <Icon name="x" size={15} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-2 border px-2.5 py-1 font-display text-[11px] font-semibold tracking-[0.1em]"
              style={{ color: meta.color, borderColor: meta.color + "44", background: meta.soft }}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${asset.status === "IN_SERVICE" ? "led-pulse" : ""}`}
                style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
              />
              {meta.label.toUpperCase()}
            </span>
            <span className="border border-edge bg-panel2 px-2.5 py-1 text-[11px] text-dim">
              {asset.category}
            </span>
            <span
              className="ml-auto border px-2 py-1 font-mono text-[10px] font-semibold"
              style={{ color: wColor, borderColor: wColor + "55", background: wColor + "12" }}
            >
              {wDays < 0 ? "WARRANTY EXPIRED" : `WARRANTY ${wDays}D`}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Field label="SITE">
              <span className="font-mono font-semibold text-signal">{asset.site}</span>
              <span className="ml-2 text-dim">{site ? `${site.name}, ${site.country}` : "—"}</span>
            </Field>
            <Field label="RACK / SLOT">
              <span className="font-mono">{asset.rack || "—"}</span>
            </Field>
            <Field label="HW / SW VERSION">
              <span className="font-mono">{asset.version}</span>
            </Field>
            <Field label="IN FLEET">
              <span className="font-mono tabular-nums">{ageDays} days</span>
            </Field>
            <Field label="INSTALLED">
              <span className="font-mono">{fmtDate(asset.installed)}</span>
            </Field>
            <Field label="WARRANTY EXPIRY">
              <span className="font-mono">{fmtDate(asset.warranty)}</span>
            </Field>
            <Field label="LAST UPDATED">
              <span className="font-mono">{fmtStamp(asset.updatedAt)}</span>
            </Field>
            <Field label="REGION">
              {site ? site.region : "—"}
            </Field>
          </div>

          {asset.notes && (
            <div className="mt-4 border-l-2 border-flare bg-panel2/50 px-3 py-2.5">
              <p className="font-mono text-[9px] tracking-[0.22em] text-faint">FIELD NOTES</p>
              <p className="mt-1 text-[13px] leading-relaxed text-dim">{asset.notes}</p>
            </div>
          )}

          {/* quick status change */}
          <div className="mt-5">
            <p className="font-mono text-[10px] tracking-[0.22em] text-faint">SET STATUS</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((st) => {
                const m = STATUS_META[st];
                const activeSt = asset.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => onStatus(asset.id, st)}
                    disabled={activeSt}
                    title={m.desc}
                    className="border px-2.5 py-1.5 font-display text-[10px] font-semibold tracking-[0.1em] transition-all active:translate-y-px disabled:cursor-default"
                    style={
                      activeSt
                        ? { color: "#0c1526", background: m.color, borderColor: m.color }
                        : { color: m.color, borderColor: m.color + "40", background: "transparent" }
                    }
                  >
                    {m.label.toUpperCase()}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-faint">{meta.desc}</p>
          </div>
        </div>

        {/* footer */}
        <div className="flex gap-2 border-t border-edge px-5 py-4">
          <button
            onClick={() => onEdit(asset)}
            className="flex h-9 flex-1 items-center justify-center gap-2 border border-edge bg-panel2 text-xs font-semibold tracking-wide text-dim transition-all hover:border-edge2 hover:text-paper active:translate-y-px"
          >
            <Icon name="edit" size={14} /> EDIT DETAILS
          </button>
          <button
            onClick={() => onDelete(asset)}
            className="flex h-9 flex-1 items-center justify-center gap-2 border border-bad/50 text-xs font-bold tracking-wide text-bad transition-all hover:bg-bad/10 active:translate-y-px"
          >
            <Icon name="trash" size={14} /> REMOVE
          </button>
        </div>
      </aside>
    </div>
  );
}
