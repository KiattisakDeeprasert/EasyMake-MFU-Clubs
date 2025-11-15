// app/admin/layout.tsx
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

  useEffect(() => {
    if (isPublic) return;
    if (loading) return;

    if (!role || role === "user") {
      router.replace("/admin/login");
    }
  }, [isPublic, loading, role, router]);

  if (!isPublic && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking your session...</p>
      </div>
    );
  }

  // public routes (login / not-authorized) ไม่ต้องมี sidebar
  if (isPublic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
