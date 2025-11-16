"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, loading } = useAuth();

  const isPublic =
    pathname === "/admin/login" ||
    pathname?.startsWith("/admin/login") ||
    pathname === "/admin/not-authorized";

  const isAdminRole =
    role === "super-admin" || role === "club-leader" || role === "co-leader";

  useEffect(() => {
    if (loading) return;       
    if (isPublic) return;      

    if (!isAdminRole) {
      router.replace("/admin/login");
    }
  }, [loading, isPublic, isAdminRole, router]);

  // ระหว่างรออ่าน cookie + ไม่ใช่หน้า public
  if (!isPublic && loading) {
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

  // หน้า private + admin role แล้ว
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
