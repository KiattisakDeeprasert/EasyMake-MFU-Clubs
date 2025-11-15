"use client";

import { useEffect, useState } from "react";

export type Role = "user" | "club-leader" | "co-leader" | "super-admin" | null;

export type AuthState = {
  loading: boolean;
  role: Role;
  email: string | null;
  token: string | null;
  clubId: string | null;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function useAuth(): AuthState {
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    role: null,
    email: null,
    token: null,
    clubId: null,
  });

  useEffect(() => {
    const roleCookie = readCookie("role");

    const role: Role =
      roleCookie === "user" ||
      roleCookie === "club-leader" ||
      roleCookie === "co-leader" ||
      roleCookie === "super-admin"
        ? (roleCookie as Role)
        : null;

    const email = readCookie("email");
    const token = readCookie("token");
    const clubId = readCookie("clubId");

    setAuth({
      loading: false,
      role,
      email,
      token,
      clubId,
    });
  }, []);

  return auth;
}

export function useRole(): Role {
  return useAuth().role;
}