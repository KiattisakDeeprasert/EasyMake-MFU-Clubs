"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, User, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import UserMenu from "./UserMenu";
import { NotificationBellContainer } from "../../notifications/NotificationBellContainer";
import { getMe } from "@/services/authService";

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await getMe();
        if (!cancelled) {
          setIsLoggedIn(!!me);
        }
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const navItems = [
    { href: "/user", label: "Home" },
    { href: "/user/club", label: "Club" },
    { href: "/user/activities", label: "Activities" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center h-16">
          {/* LEFT: burger (mobile) + logo (desktop) */}
          <div className="flex items-center gap-2 z-20">
            {/* burger mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            {/* logo desktop */}
            <Link
              href="/user"
              className="hidden md:flex items-center gap-2"
            >
              <div className="relative w-20 h-20">
                <Image
                  src="/brand-icon.png"
                  alt="EasyMake Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* CENTER: logo mobile + desktop nav */}
          <div className="absolute inset-x-0 flex justify-center items-center h-16 pointer-events-none">
            {/* logo mobile */}
            <Link
              href="/user"
              className="md:hidden flex items-center gap-2 pointer-events-auto"
            >
              <div className="relative w-16 h-16">
                <Image
                  src="/brand-icon.png"
                  alt="EasyMake Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* desktop nav  */}
            <div className="hidden md:flex items-center justify-center gap-8 h-16 pointer-events-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex items-center text-sm font-medium transition-colors hover:text-primary"
                  >
                    <span
                      className={isActive ? "text-primary" : "text-foreground"}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: login / user menu  */}
          <div className="ml-auto flex items-center gap-2 z-20">
            {!checking && (
              <>
                {isLoggedIn ? (
                  <>
                    {/*  notification + user menu  desktop และ mobile */}
                    <NotificationBellContainer />
                    <UserMenu />
                  </>
                ) : (
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                  >
                    <Link href="/user/auth/login">Login</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu (slide down) */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
