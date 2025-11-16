"use client";

import { useEffect, useRef, useState } from "react";
import { User, LogOut, User2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/user/ConfirmDialog";
import { logoutRequest } from "@/services/authService";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleConfirmLogout() {
    await logoutRequest();

    deleteCookie("role");
    deleteCookie("email");
    deleteCookie("clubId");
    deleteCookie("token");

    setConfirmOpen(false);
    setOpen(false);
    router.replace("/user/auth/login");
    router.refresh?.();
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)}>
          <User className="w-5 h-5" />
        </Button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg overflow-hidden"
            >
              {/* My Activities & My Clubs */}
              <button
                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                onClick={() => {
                  setOpen(false);
                  router.push("/user/my");
                }}
              >
                <User2 className="w-4 h-4" />
                <span>My Activities & My Clubs</span>
              </button>

              {/* Logout + Confirm */}
              <button
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                onClick={() => setConfirmOpen(true)}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialog confirm logout */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm logout"
        message="Are you sure you want to logout?"
        onConfirm={handleConfirmLogout}
        onCancel={handleConfirmLogout}
      />
    </>
  );
}
