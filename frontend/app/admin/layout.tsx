"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, ready } = useAuth();

  const isPublic =
    pathname === "/admin/login" ||
    pathname?.startsWith("/admin/login") ||
    pathname === "/admin/not-authorized";

  useEffect(() => {
    // หน้า public ไม่ต้องเช็ค
    if (isPublic) return;

    // ยังอ่าน cookie ไม่เสร็จ
    if (!ready) return;

    // ถ้าไม่ใช่ role admin → เด้งกลับหน้า login
    if (
      role !== "super-admin" &&
      role !== "club-leader" &&
      role !== "co-leader"
    ) {
      router.replace("/admin/login");
    }
  }, [isPublic, ready, role, router]);

  // รออ่าน cookie ก่อน สำหรับหน้า private
  if (!isPublic && !ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking your session...</p>
      </div>
    );
  }

  // หน้า login / not-authorized
  if (isPublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        {children}
      </div>
    );
  }

  // หน้า admin ปกติ
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
