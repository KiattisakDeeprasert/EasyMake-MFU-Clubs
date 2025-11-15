"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useRole(); // "loading" | Role

  const isPublic =
    pathname === "/admin/login" ||
    pathname?.startsWith("/admin/login") ||
    pathname === "/admin/not-authorized";

  // redirect เฉพาะหน้า private และเฉพาะตอน role รู้ค่าแล้ว
  useEffect(() => {
    if (isPublic) return;

    if (role === "loading") return; // รออ่าน cookie ก่อน

    if (role === null) {
      router.replace("/admin/login");
    }
  }, [role, isPublic, router]);

  // ระหว่างรออ่าน cookie
  if (!isPublic && role === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking your session...</p>
      </div>
    );
  }

  // หน้า public (login / not-authorized)
  if (isPublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        {children}
      </div>
    );
  }

  // หน้า private + role มีค่าแล้ว
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
