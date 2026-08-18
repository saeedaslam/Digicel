import { useEffect, useState, type FormEvent } from "react";
import type { Asset, AssetInput, Category, Status } from "../lib/types";
import { CATEGORIES, SITES, STATUS_META, STATUS_ORDER } from "../lib/types";
import { Icon } from "./icons";

interface Props {
  initial: Asset | null; // null → create mode
  onClose: () => void;
  onSave: (input: AssetInput, id?: string) => void;
}

interface FormState {
  serial: string;
  description: string;
  category: Category;
  status: Status;
  site: string;
  rack: string;
  version: string;
  installed: string;
  warranty: string;
  notes: string;
}

const inputCls =
  "w-full border border-edge bg-panel2 px-3 py-2 text-[13px] text-paper placeholder:text-faint transition-colors hover:border-edge2 focus:border-signal focus:outline-none";
const errCls =
  "w-full border border-bad/70 bg-panel2 px-3 py-2 text-[13px] text-paper placeholder:text-faint focus:border-bad focus:outline-none";
const labelCls = "mb-1 block font-mono text-[9px] tracking-[0.22em] text-faint";

function todayIso(offset = 0): string {
  return new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
}

export function AssetFormModal({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          serial: initial.serial,
          description: initial.description,
          category: initial.category,
          status: initial.status,
          site: initial.site,
          rack: initial.rack === "—" ? "" : initial.rack,
          version: initial.version,
          installed: initial.installed,
          warranty: initial.warranty,
          notes: initial.notes ?? "",
        }
      : {
          serial: "",
          description: "",
          category: "Compute Blade",
          status: "COMMISSIONING",
          site: "KIN",
          rack: "",
          version: "",
          installed: todayIso(),
          warranty: todayIso(365),
          notes: "",
        }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.serial.trim()) next.serial = "Serial number is required.";
    else if (form.serial.trim().length < 4) next.serial = "Serial must be at least 4 characters.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.version.trim()) next.version = "HW/SW version is required.";
    if (!form.installed) next.installed = "Install date is required.";
    if (!form.warranty) next.warranty = "Warranty expiry is required.";
    else if (form.installed && form.warranty <= form.installed)
      next.warranty = "Warranty must end after the install date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(
      {
        serial: form.serial.trim(),
        description: form.description.trim(),
        category: form.category,
        status: form.status,
        site: form.site,
        rack: form.rack.trim() || "—",
        version: form.version.trim(),
        installed: form.installed,
        warranty: form.warranty,
        notes: form.notes.trim() || undefined,
      },
      initial?.id
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="anim-fade absolute inset-0 bg-abyss/80" onClick={onClose} />
      <form
        onSubmit={submit}
        className="anim-pop relative max-h-[92vh] w-full max-w-xl overflow-y-auto border border-edge bg-panel shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        noValidate
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-edge bg-panel px-5 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-faint">
              {initial ? "ASSET RECORD" : "NEW REGISTRATION"}
            </p>
            <h2 className="mt-0.5 font-display text-base font-bold tracking-wide text-paper">
              {initial ? `EDIT — ${initial.serial}` : "REGISTER CHARGING-SYSTEM UNIT"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="flex h-8 w-8 items-center justify-center border border-edge text-faint transition-colors hover:border-edge2 hover:text-paper"
          >
            <Icon name="x" size={15} />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-3.5 px-5 py-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="f-desc">DESCRIPTION *</label>
            <input
              id="f-desc"
              className={errors.description ? errCls : inputCls}
              placeholder="e.g. CPM3 Central Processing Module"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            {errors.description && <p className="mt-1 text-[11px] text-bad">{errors.description}</p>}
          </div>

          <div>
            <label className={labelCls} htmlFor="f-serial">SERIAL NUMBER *</label>
            <input
              id="f-serial"
              className={`${errors.serial ? errCls : inputCls} font-mono`}
              placeholder="EC-CPM3-XXXXXXXX"
              value={form.serial}
              onChange={(e) => set("serial", e.target.value.toUpperCase())}
            />
            {errors.serial && <p className="mt-1 text-[11px] text-bad">{errors.serial}</p>}
          </div>

          <div>
            <label className={labelCls} htmlFor="f-version">HW / SW VERSION *</label>
            <input
              id="f-version"
              className={`${errors.version ? errCls : inputCls} font-mono`}
              placeholder="ECS 22.1b"
              value={form.version}
              onChange={(e) => set("version", e.target.value)}
            />
            {errors.version && <p className="mt-1 text-[11px] text-bad">{errors.version}</p>}
          </div>

          <div>
            <label className={labelCls} htmlFor="f-cat">CATEGORY</label>
            <div className="relative">
              <select
                id="f-cat"
                className={`${inputCls} appearance-none pr-8`}
                value={form.category}
                onChange={(e) => set("category", e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint">
                <Icon name="chevronDown" size={13} />
              </span>
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="f-status">STATUS</label>
            <div className="relative">
              <select
                id="f-status"
                className={`${inputCls} appearance-none pr-8`}
                value={form.status}
                onChange={(e) => set("status", e.target.value as Status)}
              >
                {STATUS_ORDER.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_META[st].label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint">
                <Icon name="chevronDown" size={13} />
              </span>
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="f-site">SITE *</label>
            <div className="relative">
              <select
                id="f-site"
                className={`${inputCls} appearance-none pr-8`}
                value={form.site}
                onChange={(e) => set("site", e.target.value)}
              >
                {SITES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}, {s.country}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint">
                <Icon name="chevronDown" size={13} />
              </span>
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="f-rack">RACK / SLOT</label>
            <input
              id="f-rack"
              className={`${inputCls} font-mono`}
              placeholder="A-04 or SPARE"
              value={form.rack}
              onChange={(e) => set("rack", e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="f-inst">INSTALLED *</label>
            <input
              id="f-inst"
              type="date"
              className={`${errors.installed ? errCls : inputCls} font-mono`}
              value={form.installed}
              onChange={(e) => set("installed", e.target.value)}
            />
            {errors.installed && <p className="mt-1 text-[11px] text-bad">{errors.installed}</p>}
          </div>

          <div>
            <label className={labelCls} htmlFor="f-war">WARRANTY EXPIRY *</label>
            <input
              id="f-war"
              type="date"
              className={`${errors.warranty ? errCls : inputCls} font-mono`}
              value={form.warranty}
              onChange={(e) => set("warranty", e.target.value)}
            />
            {errors.warranty && <p className="mt-1 text-[11px] text-bad">{errors.warranty}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="f-notes">FIELD NOTES</label>
            <textarea
              id="f-notes"
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Fault tickets, RMA numbers, renewal quotes…"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        <footer className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-edge bg-panel px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 border border-edge bg-panel2 px-4 text-xs font-semibold tracking-wide text-dim transition-all hover:border-edge2 hover:text-paper active:translate-y-px"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="flex h-9 items-center gap-2 bg-flare px-4 text-xs font-bold tracking-wide text-white shadow-[0_4px_18px_rgba(242,59,48,0.35)] transition-all hover:bg-flare2 active:translate-y-px"
          >
            <Icon name="check" size={14} />
            {initial ? "SAVE CHANGES" : "REGISTER UNIT"}
          </button>
        </footer>
      </form>
    </div>
  );
}
