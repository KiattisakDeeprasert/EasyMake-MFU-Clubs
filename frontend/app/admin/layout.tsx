"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, ready } = useRole();

  const isPublic =
    pathname === "/admin/login" ||
    pathname?.startsWith("/admin/login") ||
    pathname === "/admin/not-authorized";

  // ✅ รอให้ ready ก่อนค่อยตัดสินใจ redirect
  useEffect(() => {
    if (!isPublic && ready) {
      // หน้า admin ทั้งหมดที่ไม่ public
      if (!role) {
        router.replace("/admin/login");
      }
    }
  }, [isPublic, ready, role, router]);

  // ✅ ตอนยังไม่ ready ให้โชว์ loading เฉย ๆ อย่าเพิ่ง render layout/redirect
  if (!isPublic && !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Checking admin permission...
      </div>
    );
  }

  // ✅ หน้า public (login / not-authorized)
  if (isPublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        {children}
      </div>
    );
  }

  // ✅ หน้า admin ปกติ
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}
