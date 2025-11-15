"use client";

import { useEffect, useState } from "react";

export type Role = "user" | "club-leader" | "co-leader" | "super-admin" | null;

export type AuthState = {
  ready: boolean;          // อ่าน cookie เสร็จหรือยัง
  role: Role;
  email: string | null;
  token: string | null;
  clubId: string | null;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  // แก้ให้ทนทาน: split ด้วย ';' แล้ว trim ช่องว่าง
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (key.trim() === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    ready: false,
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

    setState({
      ready: true,
      role,
      email,
      token,
      clubId,
    });
  }, []);

  return state;
}

export function useRole(): Role {
  return useAuth().role;
}
