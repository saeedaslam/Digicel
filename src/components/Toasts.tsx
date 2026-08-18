import type { ToastMsg, ToastTone } from "../lib/store";
import { Icon, type IconName } from "./icons";

const TONE: Record<ToastTone, { color: string; icon: IconName; label: string }> = {
  success: { color: "#3ecf8e", icon: "check", label: "OK" },
  danger: { color: "#f2635c", icon: "alert", label: "ALERT" },
  warn: { color: "#f2b33d", icon: "alert", label: "WARN" },
  info: { color: "#43c6e8", icon: "radar", label: "INFO" },
};

export function Toasts({
  toasts,
  onDismiss,
}: {
  toasts: ToastMsg[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map((t) => {
        const tone = TONE[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className="anim-toast flex items-start gap-3 border bg-panel2/95 px-3.5 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm"
            style={{ borderColor: tone.color + "55" }}
          >
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center"
              style={{ color: tone.color, background: tone.color + "1f" }}
            >
              <Icon name={tone.icon} size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="font-display text-[10px] font-semibold tracking-[0.18em]"
                style={{ color: tone.color }}
              >
                {tone.label}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-paper">{t.text}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-faint transition-colors hover:text-paper"
              aria-label="Dismiss notification"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
