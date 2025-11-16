"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function ClubCard({
  club,
  viewMode,
  index,
}: {
  club: {
    _id: string;
    name: string;
    tagline?: string;
    description?: string;
    cover_image_url?: string;
    followerCount?: number;
  };
  viewMode: "grid" | "list";
  index: number;
}) {
  const followerCount = club.followerCount ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link href={`/user/club/${club._id}`}>
        <Card
          className={`bg-surface border-border overflow-hidden hover:border-primary transition-all group cursor-pointer h-full ${
            viewMode === "list" ? "flex flex-row" : ""
          }`}
        >
          {/* ===== Club Image ===== */}
          <div
            className={`relative overflow-hidden ${
              viewMode === "grid" ? "h-56" : "w-48 h-full min-h-[200px]"
            }`}
          >
            <Image
              src={club.cover_image_url || "/placeholder.svg"}
              alt={club.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>

          {/* ===== Card Content ===== */}
          <CardContent
            className={`p-5 space-y-3 ${viewMode === "list" ? "flex-1" : ""}`}
          >
            {/* Title / Tagline */}
            <div className="space-y-1">
              <h3 className="font-semibold text-xl line-clamp-1">
                {club.name}
              </h3>

              {(club.tagline || club.description) && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {club.tagline || club.description}
                </p>
              )}
            </div>

            {/* Members + Action */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  {followerCount > 0
                    ? `${followerCount} followers`
                    : "No followers yet"}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
              >
                View Club
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
