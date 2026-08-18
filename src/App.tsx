import { useMemo, useState } from "react";
import type { Asset, AssetInput, Status } from "./lib/types";
import { STATUS_META, downloadCsv } from "./lib/types";
import { useInventory } from "./lib/store";
import { TopBar } from "./components/TopBar";
import { StatsRow } from "./components/StatsRow";
import { AnalyticsPanels } from "./components/Charts";
import { FilterBar, type StatusFilter } from "./components/FilterBar";
import { AssetTable, type SortKey, type SortState } from "./components/AssetTable";
import { AssetDrawer } from "./components/AssetDrawer";
import { AssetFormModal } from "./components/AssetFormModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { Toasts } from "./components/Toasts";
import { Icon } from "./components/icons";

type ConfirmState = { kind: "delete"; asset: Asset } | { kind: "reset" } | null;

function BootScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center bg-flare shadow-[0_0_30px_rgba(242,59,48,0.5)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 4h6a8 8 0 0 1 0 16H7z" stroke="#fff" strokeWidth="2.6" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="font-mono text-[10px] tracking-[0.3em] text-faint">
            DIGICEL · NETWORK OPERATIONS
          </p>
          <p className="font-display text-xl font-bold tracking-wide text-paper">
            ECS INVENTORY <span className="text-flare">CONSOLE</span>
          </p>
        </div>
      </div>
      <div className="w-64">
        <div className="h-1 w-full overflow-hidden bg-raise">
          <div className="anim-boot h-full bg-flare" />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] tracking-[0.22em] text-faint">
          ESTABLISHING SECURE LINK · NOC-OPS-04
          <span className="cursor-blink text-flare">▌</span>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const inv = useInventory();

  const [query, setQuery] = useState("");
  const [statusF, setStatusF] = useState<StatusFilter>("ALL");
  const [categoryF, setCategoryF] = useState("ALL");
  const [siteF, setSiteF] = useState("ALL");
  const [sort, setSort] = useState<SortState>({ key: "serial", dir: "asc" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  /* ---------- derived data ---------- */

  const counts = useMemo(() => {
    const c: Record<Status, number> = {
      IN_SERVICE: 0,
      STANDBY: 0,
      COMMISSIONING: 0,
      FAULTY: 0,
      RMA: 0,
    };
    for (const a of inv.assets) c[a.status]++;
    return c;
  }, [inv.assets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inv.assets.filter((a) => {
      if (statusF !== "ALL" && a.status !== statusF) return false;
      if (categoryF !== "ALL" && a.category !== categoryF) return false;
      if (siteF !== "ALL" && a.site !== siteF) return false;
      if (q) {
        const hay =
          `${a.serial} ${a.description} ${a.notes ?? ""} ${a.site} ${a.category} ${a.version} ${a.rack}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [inv.assets, query, statusF, categoryF, siteF]);

  const rows = useMemo(() => {
    const mul = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      return va < vb ? -mul : va > vb ? mul : 0;
    });
  }, [filtered, sort]);

  const filtersActive =
    query.trim() !== "" || statusF !== "ALL" || categoryF !== "ALL" || siteF !== "ALL";

  const selected = selectedId
    ? inv.assets.find((a) => a.id === selectedId) ?? null
    : null;

  const emptyKind: "all" | "filtered" | null =
    inv.assets.length === 0 ? "all" : rows.length === 0 ? "filtered" : null;

  /* ---------- handlers ---------- */

  const handleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );

  const clearFilters = () => {
    setQuery("");
    setStatusF("ALL");
    setCategoryF("ALL");
    setSiteF("ALL");
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (a: Asset) => {
    setEditing(a);
    setFormOpen(true);
  };

  const handleSave = (input: AssetInput, id?: string) => {
    if (id) {
      inv.updateAsset(id, input);
      inv.pushToast("success", `${input.serial} updated.`);
    } else {
      inv.addAsset(input);
      inv.pushToast("success", `${input.serial} registered at ${input.site}.`);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleStatus = (id: string, st: Status) => {
    const a = inv.assets.find((x) => x.id === id);
    inv.setStatus(id, st);
    if (a && a.status !== st)
      inv.pushToast("success", `${a.serial} set to ${STATUS_META[st].label}.`);
  };

  const handleExport = () => {
    if (rows.length === 0) {
      inv.pushToast("warn", "Nothing to export — the current view is empty.");
      return;
    }
    downloadCsv(
      rows,
      `digicel-ecs-inventory-${new Date().toISOString().slice(0, 10)}.csv`
    );
    inv.pushToast(
      "info",
      `Exported ${rows.length} unit${rows.length === 1 ? "" : "s"} to CSV.`
    );
  };

  const confirmAction = () => {
    if (!confirm) return;
    if (confirm.kind === "delete") {
      inv.removeAsset(confirm.asset.id);
      inv.pushToast("danger", `${confirm.asset.serial} removed from the register.`);
      if (selectedId === confirm.asset.id) setSelectedId(null);
    } else {
      inv.resetAll();
      inv.pushToast("info", "Demo fleet restored — 35 units loaded.");
    }
    setConfirm(null);
  };

  if (!inv.ready) return <BootScreen />;

  /* ---------- render ---------- */

  return (
    <div className="relative min-h-screen">
      {/* ambient layers */}
      <div className="gridlines pointer-events-none fixed inset-0" />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(720px 340px at 12% -4%, rgba(242,59,48,0.09), transparent 65%), radial-gradient(780px 380px at 92% 4%, rgba(67,198,232,0.07), transparent 65%)",
        }}
      />

      <div className="relative">
        <TopBar onAdd={openAdd} onExport={handleExport} unitCount={inv.assets.length} />

        {inv.storageWarn && (
          <div className="border-b border-warn/40 bg-warn/10 px-4 py-2 text-center font-mono text-[11px] tracking-[0.14em] text-warn">
            LOCAL STORAGE UNAVAILABLE — CHANGES WILL NOT SURVIVE A RELOAD
          </div>
        )}

        <main className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6">
          <StatsRow assets={inv.assets} />
          <AnalyticsPanels assets={inv.assets} onSelect={setSelectedId} />

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold tracking-[0.2em] text-paper">
                <span className="text-flare">
                  <Icon name="server" size={16} />
                </span>
                UNIT REGISTER
              </h2>
              <span className="h-px flex-1 bg-edge" />
              <span className="hidden font-mono text-[10px] tracking-[0.16em] text-faint sm:block">
                CLICK A ROW FOR FULL RECORD
              </span>
            </div>

            <FilterBar
              query={query}
              onQuery={setQuery}
              status={statusF}
              onStatus={setStatusF}
              category={categoryF}
              onCategory={setCategoryF}
              site={siteF}
              onSite={setSiteF}
              counts={counts}
              total={inv.assets.length}
              shown={rows.length}
              onClear={clearFilters}
              active={filtersActive}
            />

            <AssetTable
              rows={rows}
              sort={sort}
              onSort={handleSort}
              onSelect={setSelectedId}
              onEdit={openEdit}
              onDelete={(a) => setConfirm({ kind: "delete", asset: a })}
              emptyKind={emptyKind}
              onClearFilters={clearFilters}
              onAddFirst={openAdd}
              onRestoreDemo={() => setConfirm({ kind: "reset" })}
            />
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-edge pb-6 pt-4">
            <p className="font-mono text-[10px] tracking-[0.14em] text-faint">
              DIGICEL GROUP × ERICSSON ECS · CONSOLE BUILD 2.4.1 · REGISTRY PERSISTS IN THIS BROWSER
            </p>
            <button
              onClick={() => setConfirm({ kind: "reset" })}
              className="flex h-8 items-center gap-2 border border-edge bg-panel2 px-3 font-display text-[10px] font-semibold tracking-[0.14em] text-dim transition-all hover:border-edge2 hover:text-paper active:translate-y-px"
            >
              <Icon name="rotate" size={12} />
              RESTORE DEMO DATA
            </button>
          </footer>
        </main>
      </div>

      <AssetDrawer
        asset={selected}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
        onDelete={(a) => setConfirm({ kind: "delete", asset: a })}
        onStatus={handleStatus}
      />

      {formOpen && (
        <AssetFormModal
          initial={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {confirm?.kind === "delete" && (
        <ConfirmModal
          title="REMOVE UNIT FROM REGISTER"
          confirmLabel="REMOVE UNIT"
          tone="bad"
          body={
            <>
              This permanently deletes{" "}
              <span className="font-mono text-paper">{confirm.asset.serial}</span>{" "}
              ({confirm.asset.description}) at {confirm.asset.site} from the inventory.
              This action cannot be undone.
            </>
          }
          onCancel={() => setConfirm(null)}
          onConfirm={confirmAction}
        />
      )}

      {confirm?.kind === "reset" && (
        <ConfirmModal
          title="RESTORE DEMO FLEET"
          confirmLabel="RESTORE"
          tone="warn"
          body="Replace the current register with the original 35-unit demo fleet? Any units you added or edited will be lost."
          onCancel={() => setConfirm(null)}
          onConfirm={confirmAction}
        />
      )}

      <Toasts toasts={inv.toasts} onDismiss={inv.dismissToast} />
    </div>
  );
}
