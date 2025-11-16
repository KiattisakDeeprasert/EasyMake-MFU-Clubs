"use client";

import { useEffect, useState } from "react";

export type Role = "user" | "club-leader" | "co-leader" | "super-admin" | null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return m ? decodeURIComponent(m.split("=")[1]) : null;
}

export function useRole(): Role {
  const [role, setRole] = useState<Role>(null);

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
