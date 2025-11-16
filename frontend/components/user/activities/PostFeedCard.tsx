"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PublicPostRow } from "@/services/postsService";

type Props = {
  post: PublicPostRow;
  onToggleLike: (id: string) => void;
  index?: number; 
};

export function PostFeedCard({ post, onToggleLike }: Props) {
  return (
    <Card className="bg-surface border-border overflow-hidden hover:border-primary/50 transition-all">
      <CardContent className="p-6 space-y-4">
        {/* header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
              {post.club_cover_image_url ? (
                <Image
                  src={post.club_cover_image_url}
                  alt={post.club_name || "Club"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="font-semibold text-primary text-sm">
                  {(post.club_name || "Club").slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{post.club_name || "MFU Club"}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(post.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p className="text-muted-foreground leading-relaxed line-clamp-4">
            {post.content}
          </p>

          {post.images?.[0] && (
            <div className="relative h-80 rounded-lg overflow-hidden">
              <Image
                src={post.images[0]}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => onToggleLike(post._id)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                post.likedByMe ? "fill-primary text-primary" : ""
              }`}
            />
            <span>{post.likeCount ?? 0} likes</span>
          </button>

          <Link href={`/user/club/${post.club_id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary-dark"
            >
              View Club
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
