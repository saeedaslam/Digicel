import { useEffect, useMemo, useState } from "react";
import type { Asset } from "../lib/types";
import { SITES, daysUntil } from "../lib/types";
import { Icon, type IconName } from "./icons";

function useCountUp(target: number, duration = 750): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

interface StatDef {
  key: string;
  label: string;
  icon: IconName;
  color: string;
  value: number;
  sub: string;
}

function StatCard({ stat, index }: { stat: StatDef; index: number }) {
  const value = useCountUp(stat.value);
  return (
    <div
      className="anim-rise group border border-edge bg-panel p-4 transition-colors hover:border-edge2"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.22em] text-faint">{stat.label}</p>
        <span
          className="flex h-7 w-7 items-center justify-center transition-transform group-hover:scale-110"
          style={{ color: stat.color, background: stat.color + "14" }}
        >
          <Icon name={stat.icon} size={15} />
        </span>
      </div>
      <p
        className="mt-2 font-display text-[34px] font-bold leading-none tabular-nums"
        style={{ color: stat.color }}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[11px] text-dim">{stat.sub}</p>
    </div>
  );
}

export function StatsRow({ assets }: { assets: Asset[] }) {
  const stats = useMemo<StatDef[]>(() => {
    const total = assets.length;
    const inService = assets.filter((a) => a.status === "IN_SERVICE").length;
    const standby = assets.filter((a) => a.status === "STANDBY").length;
    const attention = assets.filter(
      (a) => a.status === "FAULTY" || a.status === "RMA"
    ).length;
    const warrantySoon = assets.filter((a) => daysUntil(a.warranty) <= 90).length;
    const pct = total ? Math.round((inService / total) * 100) : 0;
    return [
      {
        key: "total",
        label: "UNITS TRACKED",
        icon: "box",
        color: "#e9f0fb",
        value: total,
        sub: `across ${SITES.length} Digicel markets`,
      },
      {
        key: "svc",
        label: "IN SERVICE",
        icon: "zap",
        color: "#3ecf8e",
        value: inService,
        sub: `${pct}% of the charging estate`,
      },
      {
        key: "stby",
        label: "STANDBY / SPARE",
        icon: "layers",
        color: "#43c6e8",
        value: standby,
        sub: "hot spares armed for failover",
      },
      {
        key: "attn",
        label: "FAULT + RMA",
        icon: "wrench",
        color: attention > 0 ? "#f2635c" : "#5f7398",
        value: attention,
        sub: attention > 0 ? "tickets open — needs action" : "no open hardware faults",
      },
      {
        key: "wty",
        label: "WARRANTY ≤ 90 D",
        icon: "shield",
        color: warrantySoon > 0 ? "#f2b33d" : "#5f7398",
        value: warrantySoon,
        sub: "support renewals due",
      },
    ];
  }, [assets]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {stats.map((s, i) => (
        <StatCard key={s.key} stat={s} index={i} />
      ))}
    </div>
  );
}
