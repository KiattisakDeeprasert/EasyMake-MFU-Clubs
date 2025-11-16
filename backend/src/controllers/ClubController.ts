import { Request, Response, NextFunction } from "express";
import { ClubService } from "../services/ClubService";
import { ClubImageService } from "../services/ClubImageService";

export const ClubController = {
  createClub: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leaderUserId = (req as any).user.id;
      const club = await ClubService.createClub(leaderUserId, req.body);
      res.json({ club });
    } catch (err: unknown) {
      next(err as any);
    }
  },

  getClubPublic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clubId } = req.params;
      const club = await ClubService.getClubPublic(clubId);
      res.json({ club });
    } catch (err: unknown) {
      next(err as any);
    }
  },

  updateClubProfileSelf: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requesterUserId = (req as any).user.id;
      const { clubId } = req.params;
      const updatedClub = await ClubService.updateClubProfileByLeader(
        requesterUserId,
        clubId,
        req.body
      );
      res.json({ club: updatedClub });
    } catch (err: unknown) {
      next(err as any);
    }
  },

  listMembers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterUserId = (req as any).user.id;
      const { clubId } = req.params;
      const members = await ClubService.listClubMembers(
        requesterUserId,
        clubId
      );
      res.json({ members });
    } catch (err: unknown) {
      next(err as any);
    }
  },

  listActivities: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterUserId = (req as any).user.id;
      const { clubId } = req.params;
      const activities = await ClubService.listClubActivities(
        requesterUserId,
        clubId
      );
      res.json({ activities });
    } catch (err: unknown) {
      next(err as any);
    }
  },

  listPostsForClubStaff: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requesterUserId = (req as any).user.id;
      const { clubId } = req.params;
      const posts = await ClubService.listPostsForClubStaff(
        requesterUserId,
        clubId
      );
      res.json({ posts });
    } catch (err: unknown) {
      next(err as any);
    }
  },

  updateClubCoverImage: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requesterUserId = (req as any).user.id;
      const { clubId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await ClubImageService.updateCoverImage({
        requesterUserId,
        clubId,
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
      });

      return res.json(result);
    } catch (err: unknown) {
      next(err as any);
    }
  },

  getClubCoverImage: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { clubId } = req.params;

      const img = await ClubImageService.getCoverImageStream(clubId);
      if (!img) {
        return res.status(404).json({ message: "No cover image" });
      }

      res.setHeader("Content-Type", img.mime);

      img.stream.on("error", (err: unknown) => {
        next(err as any);
      });

      img.stream.pipe(res);
    } catch (err: unknown) {
      next(err as any);
    }
  },
  // ===== NEW: follow / unfollow / status =====
  followClub: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { clubId } = req.params;
      await ClubService.followClub(userId, clubId);
      res.json({ isFollowing: true });
    } catch (err: unknown) {
      console.error("followClub error", err);
      next(err as any);
    }
  },

  unfollowClub: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { clubId } = req.params;
      await ClubService.unfollowClub(userId, clubId);
      res.json({ isFollowing: false });
    } catch (err: unknown) {
      console.error("unfollowClub error", err);
      next(err as any);
    }
  },

  getFollowStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { clubId } = req.params;
      const isFollowing = await ClubService.getFollowStatus(userId, clubId);
      res.json({ isFollowing });
    } catch (err: unknown) {
      console.error("getFollowStatus error", err);
      next(err as any);
    }
  },
  getMyFollowingClubs: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).user.id;
      const clubs = await ClubService.getMyFollowingClubs(userId);
      res.json({ clubs });
    } catch (err: unknown) {
      next(err as any);
    }
  },
  
   listPublicClubs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clubs = await ClubService.listPublicClubs();
      res.json({ clubs });
    } catch (err: unknown) {
      next(err as any);
    }
  },
};
