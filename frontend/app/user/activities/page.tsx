"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/user/home/navigation/navigation";
import { Footer } from "@/components/footer";

import {
  getPublicPostsFeed,
  togglePostLike,
  type PublicPostRow,
} from "@/services/postsService";
import {
  getPublicActivitiesFeed,
  type ActivityFeedItem,
} from "@/services/activitiesService";
import {
  getMyFollowingClubs,
  type FollowingClub,
} from "@/services/clubsService";

import { PostFeedCard } from "@/components/user/activities/PostFeedCard";
import { ActivityCard } from "@/components/user/activities/ActivityCard";
import { FeedFilterToggle } from "@/components/user/activities/FeedFilterToggle";

type FilterMode = "all" | "following";

const LOGIN_PATH = "/user/auth/login";

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = LOGIN_PATH;
  }
}

export default function ActivitiesPage() {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [visiblePostsCount, setVisiblePostsCount] = useState(5);
  const [visibleEventsCount, setVisibleEventsCount] = useState(4);

  const [posts, setPosts] = useState<PublicPostRow[]>([]);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [followedClubIds, setFollowedClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    (async () => {
      setLoading(true);

      let postFeed: PublicPostRow[] = [];
      let actFeed: ActivityFeedItem[] = [];
      let following: FollowingClub[] = [];

      try {
        postFeed = await getPublicPostsFeed();
      } catch (err) {
        console.error("load posts feed error", err);
        postFeed = [];
      }

      try {
        actFeed = await getPublicActivitiesFeed();
      } catch (err) {
        console.error("load activities feed error", err);
        actFeed = [];
      }

      try {
        following = await getMyFollowingClubs();
      } catch (err: any) {
        const msg = String(err?.message || "");
        if (
          msg.toLowerCase().includes("unauthorized") ||
          msg.includes("401")
        ) {
          following = [];
        } else {
          console.error("load following clubs error", err);
        }
      }

      setPosts(postFeed);
      setActivities(actFeed);
      setFollowedClubIds(following.map((c) => String(c._id)));

      setLoading(false);
    })();
  }, []);


  useEffect(() => {
    setVisiblePostsCount(5);
    setVisibleEventsCount(4);
  }, [filterMode]);

  const filteredPosts = useMemo(() => {
    if (filterMode === "following") {
      if (followedClubIds.length === 0) return [];
      return posts.filter(
        (p) => p.club_id && followedClubIds.includes(String(p.club_id))
      );
    }
    return posts;
  }, [posts, filterMode, followedClubIds]);

  const filteredActivities = useMemo(() => {
    if (filterMode === "following") {
      if (followedClubIds.length === 0) return [];
      return activities.filter(
        (a) => a.club_id && followedClubIds.includes(String(a.club_id))
      );
    }
    return activities;
  }, [activities, filterMode, followedClubIds]);

  const visiblePosts = filteredPosts.slice(0, visiblePostsCount);
  const visibleEvents = filteredActivities.slice(0, visibleEventsCount);

  const hasMoreItems =
    visiblePostsCount < filteredPosts.length ||
    visibleEventsCount < filteredActivities.length;

  const handleLoadMore = () => {
    setVisiblePostsCount((prev) => Math.min(prev + 5, filteredPosts.length));
    setVisibleEventsCount((prev) =>
      Math.min(prev + 4, filteredActivities.length)
    );
  };

  // like post
  const handleToggleLike = async (postId: string) => {
    try {
      const result = await togglePostLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likeCount: result.likeCount, likedByMe: result.liked }
            : p
        )
      );
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
        redirectToLogin();
        return;
      }
      console.error("toggle like error", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* BG */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/football-tournament-stadium.jpg"
          alt="University Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 backdrop-blur-md bg-background/60" />
      </div>
      <div className="fixed inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background z-0" />

      {/* Hero */}
      <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center overflow-hidden pt-16 z-10">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="font-playfair text-5xl md:text-7xl font-bold leading-tight">
              Find Your <span className="text-primary">Point</span> Today!
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Catch up on club posts and upcoming activities from MFU clubs.
            </p>

            {/* Toggle All / Following */}
            <FeedFilterToggle mode={filterMode} onChange={setFilterMode} />
          </motion.div>
        </div>
      </section>

      {/* Feed */}
      <section className="relative py-5 z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {loading && (
              <div className="text-center py-20 text-muted-foreground">
                Loading...
              </div>
            )}

            {!loading &&
              filteredPosts.length === 0 &&
              filteredActivities.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="space-y-4">
                    <div className="text-6xl">🔔</div>
                    <h3 className="text-2xl font-semibold">
                      No posts or activities
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {filterMode === "following"
                        ? "You aren't following any clubs yet, or they haven’t posted anything."
                        : "There are no posts or activities to show right now."}
                    </p>
                  </div>
                </motion.div>
              )}

            {/* Post Feed */}
            {visiblePosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PostFeedCard post={post} onToggleLike={handleToggleLike} />
              </motion.div>
            ))}

            {/* Activity Feed */}
            {visibleEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="pt-8"
              >
                <h2 className="font-playfair text-3xl font-bold mb-6">
                  Upcoming <span className="text-primary">Activities</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visibleEvents.map((event, index) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ActivityCard event={event} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {hasMoreItems && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                className="text-center pt-8"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  className="border-primary text-primary hover:bg-primary/10 bg-white dark:bg-gray-900"
                >
                  Load More
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
