"use client";

import { useEffect, useState } from "react";

export type Role = "user" | "club-leader" | "co-leader" | "super-admin" | null;

type AuthState = {
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

/**
 * ใช้อ่าน auth จาก cookie ครั้งเดียวตอน mount แล้วเก็บไว้ใน state
 * - ระหว่างโหลด: return undefined
 * - ถ้าไม่มี session: role = null, email/token/clubId = null
 */
export function useAuth(): AuthState | undefined {
  const [auth, setAuth] = useState<AuthState | undefined>(undefined);

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
      role,
      email,
      token,
      clubId,
    });
  }, []);

  return auth;
}

/**
 * hook เดิมเอาไว้ใช้เฉพาะ role อย่างเดียว
 */
export function useRole(): Role | undefined {
  const auth = useAuth();
  return auth?.role;
}
