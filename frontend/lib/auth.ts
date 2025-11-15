// lib/auth.ts
"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/services/authService";

export type Role = "user" | "club-leader" | "co-leader" | "super-admin" | null;

export function useAuth() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await getMe(); // เรียก /me พร้อม credentials: "include"
        if (cancelled) return;

        if (
          me &&
          (me.role === "user" ||
            me.role === "club-leader" ||
            me.role === "co-leader" ||
            me.role === "super-admin")
        ) {
          setRole(me.role as Role);
        } else {
          setRole(null);
        }
      } catch (_err) {
        if (!cancelled) {
          setRole(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { role, loading };
}
