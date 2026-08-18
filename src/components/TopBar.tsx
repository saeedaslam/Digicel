import { useEffect, useState } from "react";
import { Icon } from "./icons";

const TICKER = [
  "LINK KIN⇄PAP · 4.2 MS",
  "CDR INGEST · NOMINAL",
  "ECS CORE A · 12,481 TPS PEAK",
  "DIAMETER SESSIONS · 214,902 ACTIVE",
  "SBC POS · HEALTHY",
  "BACKUP · LAST SNAP 02:00 AST · OK",
  "ERICSSON ASSET PORTAL · SYNCED 06:12",
  "ALARM FEED · 2 OPEN — TT-30914 / PO-8817",
  "ROAMING Gy · SBC KIN ATF IN PROGRESS",
];

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const time = now.toTimeString().slice(0, 8);
  const date = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="hidden text-right leading-tight md:block">
      <p className="font-mono text-sm font-medium tabular-nums text-paper">
        {time}
        <span className="cursor-blink text-flare">_</span>
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{date}</p>
    </div>
  );
}

export function TopBar({
  onAdd,
  onExport,
  unitCount,
}: {
  onAdd: () => void;
  onExport: () => void;
  unitCount: number;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-panel/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
        {/* brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-flare shadow-[0_0_22px_rgba(242,59,48,0.45)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 4h6a8 8 0 0 1 0 16H7z" stroke="#fff" strokeWidth="2.6" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-mono text-[9px] tracking-[0.3em] text-faint">
              DIGICEL&nbsp;·&nbsp;NETWORK&nbsp;OPERATIONS
            </p>
            <h1 className="font-display text-lg font-bold tracking-wide text-paper">
              ECS INVENTORY <span className="text-flare">CONSOLE</span>
            </h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <span className="hidden items-center gap-1.5 border border-edge bg-panel2 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-signal lg:flex">
            <span className="led-pulse inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            LIVE · PROD
          </span>
          <Clock />
          <div className="mx-1 hidden h-8 w-px bg-edge sm:block" />
          <button
            onClick={onExport}
            className="flex h-9 items-center gap-2 border border-edge bg-panel2 px-3 text-xs font-semibold tracking-wide text-dim transition-all hover:border-edge2 hover:text-paper active:translate-y-px"
            title="Export the current view as CSV"
          >
            <Icon name="download" size={15} />
            <span className="hidden sm:inline">EXPORT</span>
          </button>
          <button
            onClick={onAdd}
            className="flex h-9 items-center gap-2 bg-flare px-3.5 text-xs font-bold tracking-wide text-white shadow-[0_4px_18px_rgba(242,59,48,0.35)] transition-all hover:bg-flare2 active:translate-y-px"
          >
            <Icon name="plus" size={15} />
            <span className="hidden sm:inline">ADD UNIT</span>
            <span className="border-l border-white/30 pl-2 font-mono text-[10px] text-white/85 sm:hidden">
              {unitCount}
            </span>
          </button>
        </div>
      </div>

      {/* telemetry ticker */}
      <div className="overflow-hidden border-t border-edge/70 bg-abyss/80">
        <div className="marquee-track flex w-max items-center gap-7 py-1.5 pl-4">
          {[...TICKER, ...TICKER].map((line, i) => (
            <span
              key={i}
              className="flex items-center gap-7 whitespace-nowrap font-mono text-[10px] tracking-[0.16em] text-faint"
            >
              {line}
              <svg width="5" height="5" viewBox="0 0 6 6" className="text-flare" aria-hidden="true">
                <rect x="1" y="1" width="4" height="4" fill="currentColor" transform="rotate(45 3 3)" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
