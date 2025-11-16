"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid3x3, List } from "lucide-react";

export default function ClubsToolbar({
  value,
  onChange,
  viewMode,
  onToggleView,
}: {
  value: string;
  onChange: (v: string) => void;
  viewMode: "grid" | "list";
  onToggleView: (v: "grid" | "list") => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pt-4 space-y-3 md:space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search clubs..."
            className="pl-10 h-11 md:h-12 text-sm md:text-base"
          />
        </div>

        {/* View Toggle Buttons */}
        <div className="flex justify-end md:justify-start">
          <div className="inline-flex gap-1 rounded-lg p-1 border border-border bg-background">
            <Button
              type="button"
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10"
              onClick={() => onToggleView("grid")}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10"
              onClick={() => onToggleView("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
