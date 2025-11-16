import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authRequired } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// user signup (self-register)
router.post("/register", AuthController.registerNormal);

// login with password
router.post("/login", AuthController.login);

// logout
router.post("/logout", AuthController.logout);

// login/register via google
router.post("/oauth/google", AuthController.oauthGoogleCallback);

router.post("/oauth/google-token", AuthController.oauthGoogleWithIdToken);

// create club-leader (super-admin only)
router.post(
  "/create-leader",
  authRequired,
  requireRole("super-admin"),
  AuthController.createClubLeader
);

router.post("/create-super-admin", AuthController.createSuperAdmin);

// deactivate user (super-admin only)
router.patch(
  "/deactivate/:userId",
  authRequired,
  requireRole("super-admin"),
  AuthController.deactivateUser
);

export default router;
