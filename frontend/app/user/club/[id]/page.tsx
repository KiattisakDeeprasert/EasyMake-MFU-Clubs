"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/user/home/navigation/navigation";
import { Footer } from "@/components/footer";
import { ArrowLeft, Bell } from "lucide-react";
import {
  ClubDetail,
  getClubPublic,
  getClubPublicActivities,
  PublicActivity,
  getClubFollowStatus,
  followClub as followClubApi,
  unfollowClub as unfollowClubApi,
} from "@/services/clubsService";
import {
  listMyRegistrations,
  registerToActivity,
  unregisterFromActivity,
} from "@/services/activitiesService";
import { ErrorDialog } from "@/components/user/ErrorDialog";
import ClubEventsList from "@/components/user/clubs/ClubEventList";
import { ConfirmDialog } from "@/components/user/ConfirmDialog";
import { CornerToast } from "@/components/user/CornerToast";
import { getMe } from "@/services/authService";

const LOGIN_PATH = "/user/auth/login";

function isLoggedIn() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("token="));
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = LOGIN_PATH;
  }
}

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.id as string;

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [activities, setActivities] = useState<PublicActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errOpen, setErrOpen] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [registerLoadingId, setRegisterLoadingId] = useState<string | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | {
    activityId: string;
    currentlyRegistered: boolean;
  }>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cRes, aRes] = await Promise.all([
          getClubPublic(clubId),
          getClubPublicActivities(clubId),
        ]);

        const rawActivities: any[] = aRes.activities || [];

        let isFollowing = false;
        const myRegIds = new Set<string>();
        const lockedIds = new Set<string>();

        if (isLoggedIn()) {
          try {
            const [fs, regsRes] = await Promise.all([
              getClubFollowStatus(clubId),
              listMyRegistrations(),
            ]);

            isFollowing = fs.isFollowing;

            const regs = regsRes ?? [];
            regs.forEach((r) => {
              const actId = String(r.activity_id);
              if (r.status !== "cancelled") {
                myRegIds.add(actId);
              }
              if (r.status === "cancelled") {
                lockedIds.add(actId);
              }
            });
          } catch (err) {
            console.error(
              "[ClubDetailPage] optional follow/registrations fetch failed",
              err
            );
          }
        }

        const enrichedActs: PublicActivity[] = rawActivities.map((act) => ({
          ...act,
          is_registered: myRegIds.has(String(act._id)),
          registration_locked_for_me: lockedIds.has(String(act._id)),
        }));

        setClub(cRes.club);
        setActivities(enrichedActs);
        setFollowing(isFollowing);
      } catch (e: any) {
        setErrMsg(e?.message || "Failed to load club");
        setErrOpen(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [clubId]);
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await getMe();
        if (!cancelled) {
          setLoggedIn(!!me);
        }
      } catch {
        if (!cancelled) setLoggedIn(false);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [cRes, aRes] = await Promise.all([
          getClubPublic(clubId),
          getClubPublicActivities(clubId),
        ]);

        const rawActivities: any[] = aRes.activities || [];

        let isFollowing = false;
        const myRegIds = new Set<string>();
        const lockedIds = new Set<string>();

        if (loggedIn) {
          try {
            const [fs, regsRes] = await Promise.all([
              getClubFollowStatus(clubId),
              listMyRegistrations(),
            ]);

            isFollowing = fs.isFollowing;

            const regs = regsRes ?? [];
            regs.forEach((r) => {
              const actId = String(r.activity_id);
              if (r.status !== "cancelled") {
                myRegIds.add(actId);
              }
              if (r.status === "cancelled") {
                lockedIds.add(actId);
              }
            });
          } catch (err) {
            console.error(
              "[ClubDetailPage] optional follow/registrations fetch failed",
              err
            );
          }
        }

        const enrichedActs: PublicActivity[] = rawActivities.map((act) => ({
          ...act,
          is_registered: myRegIds.has(String(act._id)),
          registration_locked_for_me: lockedIds.has(String(act._id)),
        }));

        if (!cancelled) {
          setClub(cRes.club);
          setActivities(enrichedActs);
          setFollowing(isFollowing);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErrMsg(e?.message || "Failed to load club");
          setErrOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clubId, loggedIn]);

  const handleToggleFollow = async () => {
    if (!authChecked) return;

    if (!loggedIn) {
      redirectToLogin();
      return;
    }

    try {
      setFollowLoading(true);

      if (following) {
        await unfollowClubApi(clubId);
        setToastMessage("Unfollowed this club.");
      } else {
        await followClubApi(clubId);
        setToastMessage("You are now following this club.");
      }

      setToastOpen(true);

      try {
        const fs = await getClubFollowStatus(clubId);
        setFollowing(fs.isFollowing);
      } catch {
        setFollowing((prev) => !prev);
      }
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
        redirectToLogin();
        return;
      }

      setErrMsg(msg || "Failed to update follow status");
      setErrOpen(true);
    } finally {
      setFollowLoading(false);
    }
  };

  // ======= handler: register / unregister activity =======
  const handleToggleRegister = (
    activityId: string,
    currentlyRegistered: boolean
  ) => {
    if (!authChecked) return;

    if (!loggedIn) {
      redirectToLogin();
      return;
    }

    setPendingAction({ activityId, currentlyRegistered });
    setConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-28 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-28 text-center">
          Not found
        </div>
      </div>
    );
  }

  const executeAction = async () => {
    if (!pendingAction) return;
    const { activityId, currentlyRegistered } = pendingAction;

    try {
      setRegisterLoadingId(activityId);

      if (currentlyRegistered) {
        await unregisterFromActivity(activityId);

        setActivities((prev) =>
          prev.map((a) =>
            a._id === activityId
              ? {
                  ...a,
                  is_registered: false,
                  registration_locked_for_me: true,
                  registered: Math.max(0, a.registered - 1),
                }
              : a
          )
        );

        setToastMessage(
          "Registration cancelled. You cannot register this activity again."
        );
        setToastOpen(true);
      } else {
        await registerToActivity(activityId);

        setActivities((prev) =>
          prev.map((a) =>
            a._id === activityId
              ? {
                  ...a,
                  is_registered: true,
                  registered: a.registered + 1,
                }
              : a
          )
        );

        setToastMessage("Registered to activity successfully.");
        setToastOpen(true);
      }
    } catch (e: any) {
      const msg =
        e?.message || "Failed to update registration. Please try again later.";

      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.includes("401 Unauthorized")
      ) {
        redirectToLogin();
        return;
      }

      if (!currentlyRegistered && msg.includes("later cancelled")) {
        setActivities((prev) =>
          prev.map((a) =>
            a._id === activityId
              ? { ...a, registration_locked_for_me: true }
              : a
          )
        );
      }

      setErrMsg(msg);
      setErrOpen(true);
    } finally {
      setRegisterLoadingId(null);
      setConfirmOpen(false);
      setPendingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* hero section + follow button (เหมือนเดิม) */}
      <section
        className="
    relative 
    h-[60vh] 
    min-h-[480px] 
    overflow-hidden 
    pt-24           /* mobile + ipad: ดันลงล่างขึ้นนิดนึง */
    lg:pt-16        /* desktop: กลับไปเท่าเดิม */
  "
      >
        <div className="absolute inset-0">
          <Image
            src={club.cover_image_url || "/placeholder.svg"}
            alt={club.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* ปุ่ม Back เหมือนเดิมทุกขนาดหน้าจอ */}
        <div className="absolute top-20 left-4 z-20">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Link href="/user/club">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clubs
            </Link>
          </Button>
        </div>

        <div className="container mx-auto px-4 relative z-10 h-full flex items-end pb-10 lg:pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full ml-4 md:ml-6 lg:ml-[40px]" // desktop = ของเดิม
          >
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-primary text-background border-0 capitalize">
                    Club
                  </Badge>

                  {/* mobile / ipad เล็กลง, desktop เท่าเดิม */}
                  <h1
                    className="
                font-playfair 
                font-bold
                text-3xl       /* mobile */
                md:text-4xl    /* ipad / tablet */
                lg:text-6xl    /* desktop = เดิมเป๊ะ */
              "
                  >
                    {club.name}
                  </h1>

                  {club.description && (
                    <p
                      className="
                  text-sm            /* mobile อ่านง่ายขึ้น ไม่ดันยาวเกิน */
                  md:text-base       /* ipad */
                  lg:text-lg         /* desktop = เดิม */
                  text-muted-foreground 
                  max-w-3xl 
                  leading-relaxed
                "
                    >
                      {club.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={
                      following
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-primary hover:bg-primary-dark text-background"
                    }
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    {following ? "Unfollow Club" : "Follow Club"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* about / events */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="about" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-surface border border-border">
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-primary data-[state=active]:text-background"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-primary data-[state=active]:text-background"
              >
                Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-8">
              <Card className="bg-surface border-border">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <h2 className="font-playfair text-3xl font-bold">
                      About {club.name}
                    </h2>
                    {club.description ? (
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {club.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        No description.
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-border space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Status
                        </div>
                        <div className="font-medium capitalize">
                          {club.status}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Members
                        </div>
                        <div className="font-medium">
                          {typeof club.followerCount === "number"
                            ? club.followerCount
                            : 0}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Contact
                      </div>

                      {club.contact_channels &&
                      club.contact_channels.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {club.contact_channels.map((c, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                            >
                              <span className="font-medium">
                                {c.platform || "Channel"}
                              </span>
                              <span className="mx-1">·</span>
                              <span>{c.handle || "—"}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No contact info yet.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="mt-8">
              <ClubEventsList
                activities={activities}
                onToggleRegister={handleToggleRegister}
                loadingActivityId={registerLoadingId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />

      <ErrorDialog
        open={errOpen}
        onOpenChange={setErrOpen}
        title="Load failed"
        message={errMsg}
      />
      <ConfirmDialog
        open={confirmOpen}
        title={
          pendingAction?.currentlyRegistered
            ? "Confirm Cancel?"
            : "Confirm Registration?"
        }
        message={
          pendingAction?.currentlyRegistered
            ? "If you cancel this activity, you will NOT be able to register again."
            : "Once you register and later cancel, you will NOT be able to register again. Continue?"
        }
        onConfirm={executeAction}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
      />
      <CornerToast
        open={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
