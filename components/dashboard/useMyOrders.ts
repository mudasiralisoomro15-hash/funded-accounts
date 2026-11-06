"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listMyOrders } from "@/lib/db";
import type { OrderRecord } from "@/lib/types";

/** Loads the signed-in user's orders. `orders` is null while loading. */
export function useMyOrders() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setOrders(null);
      return;
    }
    let alive = true;
    setError(null);
    listMyOrders(uid)
      .then((o) => {
        if (alive) setOrders(o);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Could not load your orders.");
      });
    return () => {
      alive = false;
    };
  }, [uid]);

  return { orders, error };
}
