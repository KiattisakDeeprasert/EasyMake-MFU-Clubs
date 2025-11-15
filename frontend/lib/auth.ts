"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Role = "user" | "club-leader" | "co-leader" | "super-admin" | null;

export function useRole(): Role | undefined {
  const [role, setRole] = useState<Role | undefined>(undefined);
  const pathname = usePathname(); 

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
  }, [pathname]); 

  return role;
}
