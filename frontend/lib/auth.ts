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
        const me = await getMe(); 
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
      } catch {
        if (!cancelled) setRole(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { role, loading };
}

export function useRole(): Role | undefined {
  const [role, setRole] = useState<Role | undefined>(undefined);

  function readCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const m = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    return m ? decodeURIComponent(m.split("=")[1]) : null;
  }

  useEffect(() => {
    const cookieRole = readCookie("role");
    if (
      cookieRole === "club-leader" ||
      cookieRole === "co-leader" ||
      cookieRole === "super-admin" ||
      cookieRole === "user"
    ) {
      setRole(cookieRole as Role);
    } else {
      setRole(null);
    }
  }, []);

  return role; 
}
