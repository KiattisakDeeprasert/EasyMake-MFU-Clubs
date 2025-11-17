"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid3x3, List } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  viewMode: "grid" | "list";
  onToggleView: (v: "grid" | "list") => void;
};

export default function ClubsToolbar({
  value,
  onChange,
  viewMode,
  onToggleView,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pt-4 px-1 md:px-0"
    >
      {/* search (flex-1) + toggle (auto width) */}
      <div className="flex items-center gap-3 md:gap-4 w-full">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search clubs..."
            className="pl-10 h-11 md:h-12 text-sm md:text-base bg-background/80"
          />
        </div>

        {/* View Toggle Buttons */}
        <div className="flex-shrink-0">
          <div className="inline-flex gap-1 rounded-lg p-1 border border-border bg-background/90">
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
