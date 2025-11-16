"use client";

import { useEffect, useState } from "react";
import { BASE_URL } from "@/services/http";

export type Role =
  | "user"
  | "club-leader"
  | "co-leader"
  | "super-admin"
  | null;

export type AuthState = {
  loading: boolean;
  role: Role;
  email: string | null;
  clubId: string | null;
};

export function useAuth(): AuthState {
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    role: null,
    email: null,
    clubId: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          if (!cancelled) {
            setAuth({
              loading: false,
              role: null,
              email: null,
              clubId: null,
            });
          }
          return;
        }

        const data = await res.json();

        if (!cancelled) {
          setAuth({
            loading: false,
            role: (data.user?.role ?? null) as Role,
            email: data.user?.email ?? null,
            clubId: data.user?.clubId ?? null,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setAuth({
            loading: false,
            role: null,
            email: null,
            clubId: null,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return auth;
}

// ถ้าอยากได้ role อย่างเดียว
export function useRole(): Role {
  const { role } = useAuth();
  return role;
}
