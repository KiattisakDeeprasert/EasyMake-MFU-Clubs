"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isPublicAdminRoute =
    pathname === "/admin/login" ||
    pathname?.startsWith("/admin/login") ||
    pathname === "/admin/not-authorized";

  if (isPublicAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-gray-900">
      <AdminSidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
