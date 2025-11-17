"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export type NotificationUIItem = {
  id: string;
  title: string;
  body?: string;
  time?: string;
  is_read?: boolean;
  link_url?: string;
};

type Props = {
  items?: NotificationUIItem[];
  unreadCount?: number;
  onItemClick?: (item: NotificationUIItem) => void;
  onMarkAllRead?: () => void;
};

export default function NotificationMenu({
  items = [],
  unreadCount = 0,
  onItemClick,
  onMarkAllRead,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NotificationUIItem | null>(
    null
  );

  const unreadItems = items.filter((n) => !n.is_read);
  const readItems = items.filter((n) => n.is_read);

  const [filter, setFilter] = useState<"unread" | "read">("unread");

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const visibleItems = filter === "unread" ? unreadItems : readItems;

  function handleItemClick(item: NotificationUIItem) {
    onItemClick?.(item); // ให้ logic เดิม (เช่น mark read) ทำงานปกติ
    setSelectedItem(item);
    setDialogOpen(true);
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </Button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-background shadow-lg z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="font-semibold text-sm">Notifications</div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setFilter("unread")}
                    className={
                      filter === "unread"
                        ? "font-semibold text-blue-500"
                        : "hover:text-blue-400/80"
                    }
                  >
                    Unread ({unreadItems.length})
                  </button>

                  <span>·</span>

                  <button
                    type="button"
                    onClick={() => setFilter("read")}
                    className={
                      filter === "read"
                        ? "font-semibold text-foreground"
                        : "hover:text-foreground/80"
                    }
                  >
                    Read
                  </button>

                  {unreadCount > 0 && onMarkAllRead && (
                    <button
                      className="ml-2 text-[11px] text-primary hover:underline"
                      onClick={() => onMarkAllRead()}
                    >
                      Mark all
                    </button>
                  )}
                </div>
              </div>

              {/* ITEMS */}
              {visibleItems.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {filter === "unread"
                    ? "No unread notifications."
                    : "No read notifications."}
                </div>
              ) : (
                <ul className="max-h-80 overflow-auto">
                  {visibleItems.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-start gap-3
                        ${
                          !n.is_read
                            ? "bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100"
                            : "opacity-70 hover:bg-muted/50"
                        }
                      `}
                    >
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                      )}

                      <div className="block flex-1">
                        <NotificationItemContent n={n} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialog แสดงรายละเอียด notification */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">
                  {selectedItem.title}
                </DialogTitle>
                {selectedItem.time && (
                  <DialogDescription className="text-xs text-muted-foreground">
                    {selectedItem.time}
                  </DialogDescription>
                )}
              </DialogHeader>

              {selectedItem.body && (
                <div className="mt-3 text-sm leading-relaxed">
                  {selectedItem.body}
                </div>
              )}

              <DialogFooter className="mt-4 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </Button>

                {selectedItem.link_url && (
                  <Button asChild size="sm">
                    <Link href={selectedItem.link_url}>Open detail</Link>
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function NotificationItemContent({ n }: { n: NotificationUIItem }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="font-medium line-clamp-1">{n.title}</div>

      {n.body && (
        <div className="text-xs text-muted-foreground line-clamp-2">
          {n.body}
        </div>
      )}

      {n.time && (
        <div className="text-[11px] text-muted-foreground/80">{n.time}</div>
      )}
    </div>
  );
}
