import type { ReactNode } from "react";
import { Icon } from "./icons";

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  tone = "bad",
  onCancel,
  onConfirm,
}: {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  tone?: "bad" | "warn";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const color = tone === "bad" ? "#f2635c" : "#f2b33d";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="anim-fade absolute inset-0 bg-abyss/80" onClick={onCancel} />
      <div
        className="anim-pop relative w-full max-w-sm border bg-panel p-5 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        style={{ borderColor: color + "55" }}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center"
            style={{ color, background: color + "1a" }}
          >
            <Icon name="alert" size={18} />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold tracking-wide text-paper">{title}</h3>
            <div className="mt-1.5 text-[13px] leading-relaxed text-dim">{body}</div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="h-9 border border-edge bg-panel2 px-4 text-xs font-semibold tracking-wide text-dim transition-all hover:border-edge2 hover:text-paper active:translate-y-px"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="h-9 px-4 text-xs font-bold tracking-wide text-abyss transition-all active:translate-y-px"
            style={{ background: color, boxShadow: `0 4px 18px ${color}55` }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
