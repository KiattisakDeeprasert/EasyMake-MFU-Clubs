"use client";

import { useEffect, useState } from "react";

export type Role = "user" | "club-leader" | "co-leader" | "super-admin" | null;

// ฟังก์ชันอ่าน cookie แบบ reuse ได้ทั้งใน hook อื่น ๆ
export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="));
  return row ? decodeURIComponent(row.split("=")[1]) : null;
}

// helper: อ่าน role จาก cookie ตรง ๆ
export function getRoleFromCookie(): Role {
  const cookieRole = readCookie("role");
  if (
    cookieRole === "club-leader" ||
    cookieRole === "co-leader" ||
    cookieRole === "super-admin" ||
    cookieRole === "user"
  ) {
    return cookieRole as Role;
  }
  return null;
}

export function useRole(): Role | "loading" {
  const [role, setRole] = useState<Role | "loading">("loading");

  useEffect(() => {
    const r = getRoleFromCookie();
    setRole(r);
  }, []);

  return role;
}
