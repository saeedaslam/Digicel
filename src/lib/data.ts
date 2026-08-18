import type { Asset, AssetInput } from "./types";

const isoDay = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

const stamp = (offsetDays: number): string =>
  new Date(Date.now() + offsetDays * 86400000).toISOString();

let seedIdx = 0;

function unit(
  partial: Omit<AssetInput, "rack"> & { rack?: string },
  updatedDaysAgo = 1
): Asset {
  seedIdx += 1;
  return {
    id: "seed-" + String(seedIdx).padStart(2, "0"),
    rack: "—",
    notes: undefined,
    updatedAt: stamp(-updatedDaysAgo),
    ...partial,
  };
}

/**
 * Demo fleet — Digicel × Ericsson Charging System (ECS) estate.
 * Dates are generated relative to "today" so warranty-watch data
 * always stays live.
 */
export const SEED_ASSETS: Asset[] = [
  /* ---------- KIN · Kingston, Jamaica (regional core) ---------- */
  unit({ serial: "EC-CEE2100-K0118A", description: "CEE-B 2100 Core Chassis", category: "Core Chassis", status: "IN_SERVICE", site: "KIN", rack: "A-01", version: "HW R3", installed: isoDay(-822), warranty: isoDay(560), notes: "Primary ECS core chassis — pair A" }),
  unit({ serial: "EC-CEE2100-K0118B", description: "CEE-B 2100 Core Chassis", category: "Core Chassis", status: "IN_SERVICE", site: "KIN", rack: "B-01", version: "HW R3", installed: isoDay(-822), warranty: isoDay(560), notes: "Redundant core chassis — pair B" }),
  unit({ serial: "EC-CPM3-88211745", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "IN_SERVICE", site: "KIN", rack: "A-03", version: "ECS 22.1b", installed: isoDay(-820), warranty: isoDay(560) }),
  unit({ serial: "EC-CPM3-88211746", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "IN_SERVICE", site: "KIN", rack: "A-04", version: "ECS 22.1b", installed: isoDay(-820), warranty: isoDay(560) }),
  unit({ serial: "EC-CPM3-88211751", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "STANDBY", site: "KIN", rack: "B-03", version: "ECS 22.1b", installed: isoDay(-820), warranty: isoDay(560), notes: "Hot spare — auto-failover armed" }),
  unit({ serial: "EC-SPB4-70112930", description: "SPB4 Signal Processing Board", category: "Compute Blade", status: "IN_SERVICE", site: "KIN", rack: "A-06", version: "SPB 4.2", installed: isoDay(-760), warranty: isoDay(420) }),
  unit({ serial: "EC-ETMF4-55021876", description: "ET-MF4 4×10GbE Interface", category: "Interface Card", status: "IN_SERVICE", site: "KIN", rack: "A-09", version: "ET 4.1", installed: isoDay(-760), warranty: isoDay(420) }),
  unit({ serial: "EC-ETMF4-55021877", description: "ET-MF4 4×10GbE Interface", category: "Interface Card", status: "STANDBY", site: "KIN", rack: "SPARE", version: "ET 4.1", installed: isoDay(-760), warranty: isoDay(420), notes: "Shelf spare — ESD bag 12" }),
  unit({ serial: "EC-PEM3K-K0442", description: "PEM Power Entry Module 3 kW", category: "Power & Cooling", status: "IN_SERVICE", site: "KIN", rack: "A-00", version: "PEM 2.0", installed: isoDay(-822), warranty: isoDay(560) }),
  unit({ serial: "EC-FANB-K0470", description: "FAN-B Cooling Tray", category: "Power & Cooling", status: "IN_SERVICE", site: "KIN", rack: "A-00", version: "FAN 4.1", installed: isoDay(-822), warranty: isoDay(560) }),
  unit({ serial: "LIC-ECS-KIN-12K", description: "ECS Capacity License — 12k TPS", category: "License / Support", status: "IN_SERVICE", site: "KIN", version: "ECS 22.1", installed: isoDay(-822), warranty: isoDay(19), notes: "Renewal quote REQ-2291 pending with Ericsson" }, 0.1),
  unit({ serial: "EC-SBC64-P1102", description: "SBC AP 6400 Diameter Edge", category: "Network / SBC", status: "COMMISSIONING", site: "KIN", rack: "C-02", version: "SBC 8.2 SP1", installed: isoDay(-9), warranty: isoDay(721), notes: "Roaming Diameter edge — ATF in progress" }, 0.2),
  unit({ serial: "EDS-EXPS-K0311", description: "EDS Storage Expansion Shelf", category: "Storage", status: "IN_SERVICE", site: "KIN", rack: "A-12", version: "EDS 3.4", installed: isoDay(-700), warranty: isoDay(300) }),

  /* ---------- PAP · Port-au-Prince, Haiti ---------- */
  unit({ serial: "EC-CEE2100-P0207A", description: "CEE-B 2100 Core Chassis", category: "Core Chassis", status: "IN_SERVICE", site: "PAP", rack: "A-01", version: "HW R3", installed: isoDay(-645), warranty: isoDay(470) }),
  unit({ serial: "EC-CPM3-88340112", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "IN_SERVICE", site: "PAP", rack: "A-03", version: "ECS 22.1b", installed: isoDay(-645), warranty: isoDay(470) }),
  unit({ serial: "EC-CPM3-88340113", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "FAULTY", site: "PAP", rack: "A-04", version: "ECS 22.1b", installed: isoDay(-645), warranty: isoDay(88), notes: "ECC memory errors — ticket TT-30914 open, traffic failed over" }, 0.4),
  unit({ serial: "EC-ETMF4-55091240", description: "ET-MF4 4×10GbE Interface", category: "Interface Card", status: "IN_SERVICE", site: "PAP", rack: "A-08", version: "ET 4.1", installed: isoDay(-640), warranty: isoDay(470) }),
  unit({ serial: "LIC-ECS-PAP-6K", description: "ECS Capacity License — 6k TPS", category: "License / Support", status: "IN_SERVICE", site: "PAP", version: "ECS 22.1", installed: isoDay(-645), warranty: isoDay(46) }),

  /* ---------- POS · Port of Spain, Trinidad & Tobago ---------- */
  unit({ serial: "EC-CEE2100-T0301A", description: "CEE-B 2100 Core Chassis", category: "Core Chassis", status: "IN_SERVICE", site: "POS", rack: "A-01", version: "HW R3", installed: isoDay(-580), warranty: isoDay(515) }),
  unit({ serial: "EC-CPM3-88451902", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "IN_SERVICE", site: "POS", rack: "A-03", version: "ECS 22.0a", installed: isoDay(-580), warranty: isoDay(515), notes: "Upgrade to 22.1b scheduled — CR-1187" }),
  unit({ serial: "EC-CPM3-88451903", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "STANDBY", site: "POS", rack: "A-04", version: "ECS 22.0a", installed: isoDay(-580), warranty: isoDay(515) }),
  unit({ serial: "EC-SBC64-T0870", description: "SBC AP 6400 Diameter Edge", category: "Network / SBC", status: "IN_SERVICE", site: "POS", rack: "B-02", version: "SBC 8.1", installed: isoDay(-500), warranty: isoDay(400) }),
  unit({ serial: "LIC-SUP-POS-PRM", description: "ECS Premium Support Contract", category: "License / Support", status: "IN_SERVICE", site: "POS", version: "T&L 24×7", installed: isoDay(-580), warranty: isoDay(26), notes: "Auto-renew disabled — PO approval needed" }, 0.6),

  /* ---------- GEO · Georgetown, Guyana ---------- */
  unit({ serial: "EC-CEE2100-G0155A", description: "CEE-B 2100 Core Chassis", category: "Core Chassis", status: "IN_SERVICE", site: "GEO", rack: "A-01", version: "HW R2", installed: isoDay(-730), warranty: isoDay(365) }),
  unit({ serial: "EC-CPM3-88562210", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "IN_SERVICE", site: "GEO", rack: "A-03", version: "ECS 21.2c", installed: isoDay(-730), warranty: isoDay(365) }),
  unit({ serial: "EC-FANB-G0218", description: "FAN-B Cooling Tray", category: "Power & Cooling", status: "FAULTY", site: "GEO", rack: "A-00", version: "FAN 3.9", installed: isoDay(-730), warranty: isoDay(120), notes: "Bearing wear — replacement on order PO-8817" }, 0.8),
  unit({ serial: "EC-PEM3K-G0190", description: "PEM Power Entry Module 3 kW", category: "Power & Cooling", status: "IN_SERVICE", site: "GEO", rack: "A-00", version: "PEM 2.0", installed: isoDay(-730), warranty: isoDay(365) }),

  /* ---------- SUV · Suva, Fiji (Pacific hub) ---------- */
  unit({ serial: "EC-CEE2100-S0093A", description: "CEE-B 2100 Core Chassis", category: "Core Chassis", status: "RMA", site: "SUV", rack: "A-01", version: "HW R3", installed: isoDay(-690), warranty: isoDay(445), notes: "Backplane fault — RMA #RMA-77123 in transit to Ericsson" }, 0.3),
  unit({ serial: "EC-CPM3-88610047", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "IN_SERVICE", site: "SUV", rack: "A-03", version: "ECS 22.1b", installed: isoDay(-690), warranty: isoDay(445) }),
  unit({ serial: "EC-CPM3-88610048", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "STANDBY", site: "SUV", rack: "A-04", version: "ECS 22.1b", installed: isoDay(-690), warranty: isoDay(445) }),
  unit({ serial: "LIC-ECS-SUV-4K", description: "ECS Capacity License — 4k TPS", category: "License / Support", status: "IN_SERVICE", site: "SUV", version: "ECS 22.1", installed: isoDay(-690), warranty: isoDay(150) }),

  /* ---------- POM · Port Moresby, Papua New Guinea ---------- */
  unit({ serial: "EC-CEE2100-M0042A", description: "CEE-B 2100 Core Chassis", category: "Core Chassis", status: "IN_SERVICE", site: "POM", rack: "A-01", version: "HW R3", installed: isoDay(-410), warranty: isoDay(680) }),
  unit({ serial: "EC-CPM3-88701355", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "IN_SERVICE", site: "POM", rack: "A-03", version: "ECS 22.1b", installed: isoDay(-410), warranty: isoDay(680) }),
  unit({ serial: "EC-CPM3-88701356", description: "CPM3 Central Processing Module", category: "Compute Blade", status: "COMMISSIONING", site: "POM", rack: "A-04", version: "ECS 22.1b", installed: isoDay(-3), warranty: isoDay(727), notes: "Capacity expansion phase 2 — soak test running" }, 0.1),
  unit({ serial: "EC-PEM3K-M0110", description: "PEM Power Entry Module 3 kW", category: "Power & Cooling", status: "IN_SERVICE", site: "POM", rack: "A-00", version: "PEM 2.0", installed: isoDay(-410), warranty: isoDay(680) }),
];
