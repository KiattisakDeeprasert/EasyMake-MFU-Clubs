"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useRole(); // Role | undefined

  const isPublic =
    pathname === "/admin/login" ||
    pathname?.startsWith("/admin/login") ||
    pathname === "/admin/not-authorized";

  useEffect(() => {
    if (isPublic) return;

    // ยังอ่าน cookie ไม่เสร็จ
    if (role === undefined) return;

    // ถ้าไม่มี session หรือเป็น user ธรรมดา -> เด้งไปหน้า login
    if (role === null || role === "user") {
      router.replace("/admin/login");
    }
  }, [role, isPublic, router]);

  // ระหว่างรออ่าน cookie (เฉพาะหน้า private)
  if (!isPublic && role === undefined) {
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

  // หน้า private + role รู้ค่าแล้ว && ไม่ใช่ user ธรรมดา
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
