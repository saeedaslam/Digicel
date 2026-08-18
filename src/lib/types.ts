export type Status =
  | "IN_SERVICE"
  | "STANDBY"
  | "COMMISSIONING"
  | "FAULTY"
  | "RMA";

export interface StatusMeta {
  label: string;
  color: string;
  soft: string;
  desc: string;
}

export const STATUS_ORDER: Status[] = [
  "IN_SERVICE",
  "STANDBY",
  "COMMISSIONING",
  "FAULTY",
  "RMA",
];

export const STATUS_META: Record<Status, StatusMeta> = {
  IN_SERVICE: {
    label: "In Service",
    color: "#3ecf8e",
    soft: "rgba(62,207,142,0.13)",
    desc: "Carrying live charging traffic",
  },
  STANDBY: {
    label: "Standby",
    color: "#43c6e8",
    soft: "rgba(67,198,232,0.13)",
    desc: "Hot spare, ready to take over",
  },
  COMMISSIONING: {
    label: "Commissioning",
    color: "#8fa7ff",
    soft: "rgba(143,167,255,0.13)",
    desc: "Integration / acceptance test",
  },
  FAULTY: {
    label: "Faulty",
    color: "#f2b33d",
    soft: "rgba(242,179,61,0.14)",
    desc: "Defective — fault ticket open",
  },
  RMA: {
    label: "RMA",
    color: "#f2635c",
    soft: "rgba(242,99,92,0.14)",
    desc: "Returned to Ericsson for repair",
  },
};

export const CATEGORIES = [
  "Core Chassis",
  "Compute Blade",
  "Interface Card",
  "Power & Cooling",
  "Network / SBC",
  "Storage",
  "License / Support",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Site {
  code: string;
  name: string;
  country: string;
  region: "Caribbean" | "Pacific";
}

export const SITES: Site[] = [
  { code: "KIN", name: "Kingston", country: "Jamaica", region: "Caribbean" },
  { code: "PAP", name: "Port-au-Prince", country: "Haiti", region: "Caribbean" },
  { code: "POS", name: "Port of Spain", country: "Trinidad & Tobago", region: "Caribbean" },
  { code: "GEO", name: "Georgetown", country: "Guyana", region: "Caribbean" },
  { code: "SUV", name: "Suva", country: "Fiji", region: "Pacific" },
  { code: "POM", name: "Port Moresby", country: "Papua New Guinea", region: "Pacific" },
];

export const siteByCode = (code: string): Site | undefined =>
  SITES.find((s) => s.code === code);

export interface Asset {
  id: string;
  serial: string;
  description: string;
  category: Category;
  status: Status;
  site: string; // site code
  rack: string;
  version: string;
  installed: string; // yyyy-mm-dd
  warranty: string; // yyyy-mm-dd
  notes?: string;
  updatedAt: string; // ISO timestamp
}

export type AssetInput = Omit<Asset, "id" | "updatedAt">;

/* ---------------- helpers ---------------- */

export function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr.length === 10 ? dateStr + "T00:00:00" : dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${fmtDate(iso)} · ${d.toTimeString().slice(0, 5)}`;
}

export function uid(): string {
  return (
    "u" +
    Math.random().toString(36).slice(2, 8) +
    Date.now().toString(36).slice(-5)
  );
}

/* ---------------- CSV export ---------------- */

const CSV_COLS: { key: keyof Asset | "statusLabel" | "siteName"; head: string }[] = [
  { key: "serial", head: "Serial Number" },
  { key: "description", head: "Description" },
  { key: "category", head: "Category" },
  { key: "statusLabel", head: "Status" },
  { key: "siteName", head: "Site" },
  { key: "rack", head: "Rack" },
  { key: "version", head: "HW/SW Version" },
  { key: "installed", head: "Installed" },
  { key: "warranty", head: "Warranty Expiry" },
  { key: "notes", head: "Notes" },
];

export function downloadCsv(rows: Asset[], filename: string): void {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [CSV_COLS.map((c) => esc(c.head)).join(",")];
  for (const a of rows) {
    const site = siteByCode(a.site);
    const values: Record<string, unknown> = {
      ...a,
      statusLabel: STATUS_META[a.status].label,
      siteName: site ? `${site.code} — ${site.name}, ${site.country}` : a.site,
    };
    lines.push(CSV_COLS.map((c) => esc(values[c.key])).join(","));
  }
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
