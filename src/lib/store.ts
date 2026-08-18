import { useCallback, useEffect, useState } from "react";
import type { Asset, AssetInput, Status } from "./types";
import { uid } from "./types";
import { SEED_ASSETS } from "./data";

const LS_KEY = "digicel-ecs-inventory-v1";

export type ToastTone = "success" | "danger" | "info" | "warn";
export interface ToastMsg {
  id: number;
  tone: ToastTone;
  text: string;
}

type LoadResult = Asset[] | "error";

function loadInitial(): LoadResult {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SEED_ASSETS;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Asset[];
    return SEED_ASSETS;
  } catch {
    return "error";
  }
}

let toastSeq = 1;

export function useInventory() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [ready, setReady] = useState(false);
  const [storageWarn, setStorageWarn] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  /* boot: brief link-establishment state, then hydrate */
  useEffect(() => {
    const t = window.setTimeout(() => {
      const res = loadInitial();
      if (res === "error") {
        setStorageWarn(true);
        setAssets(SEED_ASSETS);
      } else {
        setAssets(res);
      }
      setReady(true);
    }, 620);
    return () => window.clearTimeout(t);
  }, []);

  /* persist */
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(assets));
    } catch {
      setStorageWarn(true);
    }
  }, [assets, ready]);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback((tone: ToastTone, text: string) => {
    const id = toastSeq++;
    setToasts((t) => [...t.slice(-3), { id, tone, text }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  const addAsset = useCallback((input: AssetInput) => {
    const asset: Asset = { ...input, id: uid(), updatedAt: new Date().toISOString() };
    setAssets((s) => [asset, ...s]);
    return asset;
  }, []);

  const updateAsset = useCallback((id: string, input: Partial<AssetInput>) => {
    setAssets((s) =>
      s.map((a) =>
        a.id === id ? { ...a, ...input, updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  const removeAsset = useCallback((id: string) => {
    setAssets((s) => s.filter((a) => a.id !== id));
  }, []);

  const setStatus = useCallback(
    (id: string, status: Status) => updateAsset(id, { status }),
    [updateAsset]
  );

  const resetAll = useCallback(() => {
    setAssets(SEED_ASSETS);
    setStorageWarn(false);
  }, []);

  return {
    assets,
    ready,
    storageWarn,
    toasts,
    pushToast,
    dismissToast,
    addAsset,
    updateAsset,
    removeAsset,
    setStatus,
    resetAll,
  };
}
