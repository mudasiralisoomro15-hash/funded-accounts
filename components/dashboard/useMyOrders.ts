"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listMyOrders } from "@/lib/db";
import type { OrderRecord } from "@/lib/types";

/** Loads the signed-in user's orders. `orders` is null while loading. */
export function useMyOrders() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isAlive: () => boolean) => {
      if (!uid) return;
      try {
        const o = await listMyOrders(uid);
        if (isAlive()) {
          setOrders(o);
          setError(null);
        }
      } catch (e) {
        if (isAlive()) setError(e instanceof Error ? e.message : "Could not load your orders.");
      }
    },
    [uid]
  );

  useEffect(() => {
    if (!uid) {
      setOrders(null);
      return;
    }
    let alive = true;
    const isAlive = () => alive;
    void load(isAlive);
    // Pick up admin decisions (approved / declined) without a manual reload.
    const timer = setInterval(() => void load(isAlive), 30000);
    const onFocus = () => void load(isAlive);
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [uid, load]);

  /** Update one order locally (after the customer submits a payment). */
  const patchOrder = useCallback((id: string, patch: Partial<OrderRecord>) => {
    setOrders((list) => (list ? list.map((o) => (o.id === id ? { ...o, ...patch } : o)) : list));
  }, []);

  return { orders, error, patchOrder };
}
