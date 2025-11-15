"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, User, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getCookie } from "cookies-next";
import UserMenu from "./UserMenu";
import { NotificationBellContainer } from "../../notifications/NotificationBellContainer";

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = getCookie("token");
    setHasToken(!!token);
  }, []);

  const navItems = [
    { href: "/user", label: "Home" },
    { href: "/user/club", label: "Club" },
    { href: "/user/activities", label: "Activities" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <div className="shrink-0 z-10">
            <Link href="/user" className="flex items-center gap-2">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2 h-16">
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

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            {hasToken ? (
              <>
                <div className="hidden md:flex">
                  <NotificationBellContainer />
                </div>
                <div className="hidden md:flex">
                  <UserMenu />
                </div>
              </>
            ) : (
              <Button
                asChild
                variant="default"
                size="sm"
                className="hidden md:flex"
              >
                <Link href="/user/auth/login">Login</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
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
              <div className="flex gap-2 pt-2 border-t border-border">
                {hasToken ? (
                  <>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </>
                ) : (
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <Link href="/user/auth/login">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
