import { Router } from "express";
import { ClubController } from "../controllers/ClubController";
import { AdminController } from "../controllers/AdminController";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { requireClubStaff } from "../middleware/clubRoleGuard";
import multer from "multer";
import { ActivityController } from "../controllers/ActivityController";
import { ClubModel } from "../models/Club.model";
import { ClubFollowerModel } from "../models/ClubFollower.model";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, 
  },
});
// public list of active clubs
router.get("/public", async (_req, res, next) => {
  try {
    const clubs = await ClubModel.find(
      { status: "active" },
      "_id name tagline status founding_members cover_image_url description"
    )
      .sort({ created_at: -1 })
      .lean();

    const clubIds = clubs.map((c: any) => c._id);

    const followerAgg = await ClubFollowerModel.aggregate([
      { $match: { club_id: { $in: clubIds } } },
      { $group: { _id: "$club_id", total: { $sum: 1 } } },
    ]);

    const followerMap = new Map<string, number>();
    followerAgg.forEach((row: any) => {
      followerMap.set(String(row._id), row.total);
    });

    const formatted = clubs.map((c: any) => ({
      _id: c._id,
      name: c.name,
      tagline: c.tagline || "",
      description: c.description || "",
      status: c.status,
      cover_image_url: c.cover_image_url || null,
      followerCount: followerMap.get(String(c._id)) || 0,
      members: c.founding_members || [],
    }));

    res.json({ clubs: formatted });
  } catch (err) {
    next(err);
  }
});

router.get("/:clubId/public-activities", ActivityController.listPublicByClub);

// super-admin list all clubs
router.get(
  "/",
  authRequired,
  requireRole("super-admin"),
  AdminController.listAllClubs
);

// club-leader create new club
router.post(
  "/",
  authRequired,
  requireRole("club-leader", "super-admin"),
  ClubController.createClub
);

// public profile
router.get("/:clubId", ClubController.getClubPublic);

// update club profile (leader/co-leader)
router.patch(
  "/:clubId/profile-self",
  authRequired,
  requireRole("club-leader", "co-leader", "super-admin"),
  requireClubStaff,
  ClubController.updateClubProfileSelf
);

// list members/followers
router.get(
  "/:clubId/followers",
  authRequired,
  requireRole("club-leader", "co-leader", "super-admin"),
  requireClubStaff,
  ClubController.listMembers
);

// list posts (dashboard)
router.get(
  "/:clubId/posts/mine",
  authRequired,
  requireRole("club-leader", "co-leader", "super-admin"),
  requireClubStaff,
  ClubController.listPostsForClubStaff
);

// list activities (dashboard)
router.get(
  "/:clubId/activities/mine",
  authRequired,
  requireRole("club-leader", "co-leader", "super-admin"),
  requireClubStaff,
  ClubController.listActivities
);

router.get(
  "/:clubId/activities",
  authRequired,
  requireRole("club-leader", "co-leader", "super-admin"),
  requireClubStaff,
  ActivityController.listActivitiesForClub
);

router.post(
  "/:clubId/activities",
  authRequired,
  requireRole("club-leader", "co-leader", "super-admin"),
  requireClubStaff,
  upload.array("images"),
  ActivityController.createActivity
);

// super admin operations
router.patch(
  "/:clubId/approve",
  authRequired,
  requireRole("super-admin"),
  AdminController.approveClub
);

router.patch(
  "/:clubId/suspend",
  authRequired,
  requireRole("super-admin"),
  AdminController.suspendClub
);

router.patch(
  "/:clubId/activate",
  authRequired,
  requireRole("super-admin"),
  AdminController.activateClub
);

router.patch(
  "/:clubId/update-with-leader",
  authRequired,
  requireRole("super-admin"),
  AdminController.updateClubWithLeader
);

router.delete(
  "/:clubId",
  authRequired,
  requireRole("super-admin"),
  AdminController.deleteClub
);

router.post(
  "/admin/create-club-with-leader",
  authRequired,
  requireRole("super-admin"),
  AdminController.createClubWithLeader
);
router.post(
  "/:clubId/cover-image",
  authRequired,
  requireRole("club-leader", "co-leader", "super-admin"),
  requireClubStaff,
  upload.single("file"),
  ClubController.updateClubCoverImage
);

router.patch(
  "/:clubId/cover-image",
  authRequired,
  requireRole("club-leader", "co-leader", "super-admin"),
  requireClubStaff,
  upload.single("file"),
  ClubController.updateClubCoverImage
);

// serve cover image
router.get("/:clubId/cover-image", ClubController.getClubCoverImage);

router.get(
  "/:clubId/follow-status",
  authRequired,
  requireRole("user", "club-leader", "co-leader", "super-admin"),
  ClubController.getFollowStatus
);

// follow club
router.post(
  "/:clubId/follow",
  authRequired,
  requireRole("user", "club-leader", "co-leader", "super-admin"),
  ClubController.followClub
);

// unfollow club
router.post(
  "/:clubId/unfollow",
  authRequired,
  requireRole("user", "club-leader", "co-leader", "super-admin"),
  ClubController.unfollowClub
);

router.get(
  "/me/following/clubs",
  authRequired,
  requireRole("user", "club-leader", "co-leader", "super-admin"),
  ClubController.getMyFollowingClubs
);

export default router;
