// src/services/NotificationService.ts
import { NotificationModel } from "../models/Notification.model";
import { buildNotificationEmail } from "../utils/emailTemplate";
import { UserModel } from "../models/User.model";
import { ClubFollowerModel } from "../models/ClubFollower.model";
import { emitToUser } from "../configs/socket";
import { sendEmail } from "../configs/mailer";
import { env } from "../configs/env";

type NotifInput = {
  type: string;
  title: string;
  body?: string;
  link_url?: string;
};

function toAbsoluteLink(link?: string) {
  if (!link) return undefined;
  if (link.startsWith("http://") || link.startsWith("https://")) return link;

  return `${env.PUBLIC_WEB_BASE}${link}`;
}

async function sendToUser(userId: string, notif: NotifInput) {
  const doc = await NotificationModel.create({
    user_id: userId,
    type: notif.type,
    title: notif.title,
    body: notif.body,
    link_url: notif.link_url,
  });

  emitToUser(userId, "notification:new", {
    id: doc._id,
    type: doc.type,
    title: doc.title,
    body: doc.body,
    link_url: doc.link_url,
    created_at: doc.get("created_at"),
    is_read: doc.is_read,
  });

  const user = await UserModel.findById(userId).lean();
  if (user?.email) {
    const html = buildNotificationEmail(
      notif.title,
      notif.body,
      toAbsoluteLink(notif.link_url)
    );
    sendEmail(user.email, `[EasyMake MFU] ${notif.title}`, html);
  }
}

async function broadcastToFollowers(clubId: string, notif: NotifInput) {
  const followers = await ClubFollowerModel.find({ club_id: clubId }).lean();

  followers.forEach((f) => {
    sendToUser(String(f.user_id), notif).catch((err) => {
      console.error("[NOTIFY] sendToUser failed:", err);
    });
  });
}

export const NotificationService = {
  sendToUser,
  broadcastToFollowers,
};
