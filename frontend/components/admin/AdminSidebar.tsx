"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants, Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CalendarDays,
  Settings,
  Shield,
  UserPlus,
  Flag,
  UsersRound,
  LogOut,
  UserCircle2,
  ChevronRight,
} from "lucide-react";
import { ConfirmDialog } from "../user/ConfirmDialog";
import { logoutRequest } from "@/services/authService";

export function AdminSidebar() {
  const role = useRole();
  const pathname = usePathname();
  const router = useRouter();   
  const [email, setEmail] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    function getCookie(name: string): string | null {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? decodeURIComponent(match[2]) : null;
    }
    const cookieEmail = getCookie("email");
    setEmail(cookieEmail);
  }, []);

  async function handleLogout() {
    await logoutRequest();

    const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `role=; path=/; expires=${expired}`;
    document.cookie = `email=; path=/; expires=${expired}`;
    document.cookie = `token=; path=/; expires=${expired}`;
    document.cookie = `clubId=; path=/; expires=${expired}`;
    router.replace("/admin/login");
  }

  const springTransition: Transition = {
    type: "spring",
    stiffness: 140,
    damping: 22,
    mass: 0.8,
  };

  const sidebarVariants: Variants = {
    hidden: { x: -260, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: springTransition,
    },
  };

  const isClubAdmin = role === "club-leader" || role === "co-leader";

  return (
    <>
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="w-64 border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white flex flex-col min-h-screen"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="px-6 py-4 border-b border-gray-200 relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-3xl -mr-12 -mt-12"
          />
          <div className="relative">
            <div className="text-sm font-semibold text-gray-900 leading-tight">
              {role === "super-admin"
                ? "Super Admin Console"
                : "Club Admin Panel"}
            </div>
            <div className="text-[10px] text-gray-500">MFU Clubs</div>
          </div>
        </motion.div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2 text-sm font-medium overflow-y-auto">
          <NavItem
            href="/admin"
            icon={LayoutDashboard}
            label="Dashboard"
            isActive={pathname === "/admin"}
          />

          {isClubAdmin && (
            <>
              <SectionLabel text="My Club" />
              <NavItem
                href="/admin/my-club"
                icon={UsersRound}
                label="Overview"
                isActive={pathname === "/admin/my-club"}
              />
              <NavItem
                href="/admin/my-club/profile"
                icon={Settings}
                label="Club Profile"
                isActive={pathname === "/admin/my-club/profile"}
              />
              <NavItem
                href="/admin/my-club/posts"
                icon={Megaphone}
                label="Posts / Announcements"
                isActive={pathname === "/admin/my-club/posts"}
              />
              <NavItem
                href="/admin/my-club/members"
                icon={Users}
                label="Followers / Members"
                isActive={pathname === "/admin/my-club/members"}
              />
              <NavItem
                href="/admin/my-club/activities"
                icon={CalendarDays}
                label="Activities"
                isActive={pathname === "/admin/my-club/activities"}
              />
            </>
          )}

          {role === "super-admin" && (
            <>
              <SectionLabel text="System" />
              <NavItem
                href="/admin/system/clubs"
                icon={Shield}
                label="All Clubs"
                isActive={pathname === "/admin/system/clubs"}
              />
              <NavItem
                href="/admin/system/leaders"
                icon={UserPlus}
                label="Create Club Leaders"
                isActive={pathname === "/admin/system/leaders"}
              />
              {/* <NavItem
                href="/admin/system/reports"
                icon={Flag}
                label="Reports"
                isActive={pathname === "/admin/system/reports"}
              /> */}
            </>
          )}
        </nav>

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="border-t border-gray-200 p-4 bg-white"
        >
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <motion.div
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            >
              <UserCircle2 className="w-8 h-8 text-gray-500" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {role === "super-admin"
                  ? "Super Admin"
                  : role === "co-leader"
                  ? "Co-Leader"
                  : "Club Leader"}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[160px]">
                {email || "—"}
              </span>
            </div>
          </div>

          {/* Logout */}
          <motion.button
            onClick={() => setLogoutConfirmOpen(true)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 text-sm font-medium transition-colors relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity" />
            <LogOut className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Logout</span>
          </motion.button>
        </motion.div>
      </motion.aside>

      {/* Confirm Logout Dialog */}
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          handleLogout();
        }}
      />
    </>
  );
}

/* ---------------------- ITEMS ---------------------- */

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all relative overflow-hidden group",
          isActive
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="activeTab"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-blue-600"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10">
          <Icon className="w-4 h-4" />
        </div>

        <span className="relative z-10">{label}</span>

        <div className="ml-auto relative z-10">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </motion.div>
    </Link>
  );
}

/* ---------------------- SECTION LABEL ---------------------- */
function SectionLabel({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="text-[10px] uppercase tracking-wide pt-4 pl-3 text-gray-400"
    >
      {text}
    </motion.div>
  );
}
