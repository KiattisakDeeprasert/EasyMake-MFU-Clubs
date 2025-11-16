import { ActivityModel } from "../models/Activity.model";
import { ActivityRegistrationModel } from "../models/ActivityRegistration.model";
import { ClubModel } from "../models/Club.model";
import { ClubFollowerModel } from "../models/ClubFollower.model";
import { UserModel } from "../models/User.model";
import { HttpError } from "../utils/errors";
import { NotificationService } from "./NotificationService";
import { getGridFsBucket } from "../utils/gridfs";
import { ObjectId } from "mongodb";
import { env } from "../configs/env";

async function assertIsClubStaff(userId: string, clubId: string) {
  const club = await ClubModel.findById(clubId);
  if (!club) throw new HttpError(404, "Club not found");

  if (club.leader_user_id === userId) return club;

  if (
    Array.isArray((club as any).co_leader_user_ids) &&
    (club as any).co_leader_user_ids.includes(userId)
  ) {
    return club;
  }

  const rel = await ClubFollowerModel.findOne({
    club_id: clubId,
    user_id: userId,
    role_at_club: { $in: ["co-leader"] },
  });

  if (!rel) throw new HttpError(403, "Not allowed to manage this club");
  return club;
}

async function assertIsClubStaffForActivity(userId: string, activity: any) {
  const club = await ClubModel.findById(activity.club_id);
  if (!club) throw new HttpError(404, "Club not found");

  if (club.leader_user_id === userId) return club;

  if (
    Array.isArray((club as any).co_leader_user_ids) &&
    (club as any).co_leader_user_ids.includes(userId)
  ) {
    return club;
  }

  const rel = await ClubFollowerModel.findOne({
    club_id: activity.club_id,
    user_id: userId,
    role_at_club: { $in: ["co-leader"] },
  });

  if (!rel) throw new HttpError(403, "Not allowed to manage this activity");
  return club;
}

async function registerToActivity(userId: string, activityId: string) {
  const activity = await ActivityModel.findById(activityId);
  if (!activity) throw new HttpError(404, "Activity not found");

  if (activity.status !== "published") {
    throw new HttpError(400, "Activity not open for registration");
  }

  if (new Date(activity.start_time).getTime() <= Date.now()) {
    throw new HttpError(400, "Registration closed (activity already started)");
  }

  const lastReg = await ActivityRegistrationModel.findOne({
    activity_id: activityId,
    user_id: userId,
  }).sort({ _id: -1 });

  if (lastReg) {
    if (lastReg.status === "cancelled") {
      throw new HttpError(
        400,
        "You already registered this activity and later cancelled. You can register only once."
      );
    } else {
      throw new HttpError(400, "You are already registered for this activity.");
    }
  }

  const activeCount = await ActivityRegistrationModel.countDocuments({
    activity_id: activityId,
    status: { $ne: "cancelled" },
  });

  if (activeCount >= activity.capacity) {
    throw new HttpError(400, "Activity full");
  }

  const reg = await ActivityRegistrationModel.create({
    activity_id: activityId,
    user_id: userId,
    status: "registered",
    checkin_at: null,
    cancelled_at: null,
  });

  const club = await ClubModel.findById(activity.club_id);
  if (club) {
    await NotificationService.sendToUser(String(club.leader_user_id), {
      type: "new_registration",
      title: `New registration: ${activity.title}`,
      body: `A user registered for your activity`,
      link_url: `/activities/${activityId}/registrations`,
    });
  }

  return reg;
}

async function storeFilesToGridFS(
  files: Express.Multer.File[]
): Promise<string[]> {
  if (!files || files.length === 0) return [];
  const bucket = getGridFsBucket();
  const urls: string[] = [];
  for (const f of files) {
    const uploadStream = bucket.openUploadStream(f.originalname, {
      contentType: f.mimetype,
    });
    await new Promise<void>((resolve, reject) => {
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => {
        const id = uploadStream.id as ObjectId;
        urls.push(`${env.PUBLIC_API_BASE}/api/files/${id.toHexString()}`);
        resolve();
      });
      uploadStream.end(f.buffer);
    });
  }
  return urls;
}

async function createActivity(
  authorUserId: string,
  clubId: string,
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    location?: string;
    start_time: Date | string;
    end_time?: Date | string;
    capacity: number;
  },
  files: Express.Multer.File[]
) {
  if (!data.title || !data.start_time || !data.capacity)
    throw new HttpError(400, "title, start_time, capacity required");
  await assertIsClubStaff(authorUserId, clubId);
  const imageUrls = await storeFilesToGridFS(files);
  const activity = await ActivityModel.create({
    club_id: clubId,
    title: data.title,
    subtitle: data.subtitle || "",
    description: data.description || "",
    location: data.location || "",
    start_time: data.start_time,
    end_time: data.end_time || null,
    capacity: data.capacity,
    images: imageUrls,
    status: "published",
  });
  NotificationService.broadcastToFollowers(String(clubId), {
    type: "activity_update",
    title: `New activity: ${data.title}`,
    body:
      data.subtitle ||
      (data.description ? String(data.description).slice(0, 120) : ""),
    link_url: `/user/activities`,
  });
  return activity;
}

async function updateDetails(
  activityId: string,
  updaterUserId: string,
  patch: {
    title?: string;
    subtitle?: string;
    description?: string;
    location?: string;
    start_time?: Date | string;
    end_time?: Date | string;
    capacity?: number;
  },
  files: Express.Multer.File[]
) {
  const activity = await ActivityModel.findById(activityId);
  if (!activity) throw new HttpError(404, "Activity not found");
  const club = await assertIsClubStaffForActivity(updaterUserId, activity);
  const newUrls = await storeFilesToGridFS(files);
  if (newUrls.length > 0)
    activity.images = [...(activity.images || []), ...newUrls];
  if (typeof patch.title !== "undefined") activity.title = patch.title;
  if (typeof patch.subtitle !== "undefined") activity.subtitle = patch.subtitle;
  if (typeof patch.description !== "undefined")
    activity.description = patch.description;
  if (typeof patch.location !== "undefined") activity.location = patch.location;
  if (typeof patch.start_time !== "undefined")
    activity.start_time = patch.start_time as any;
  if (typeof patch.end_time !== "undefined")
    activity.end_time = (patch.end_time as any) || null;
  if (typeof patch.capacity !== "undefined") activity.capacity = patch.capacity;
  await activity.save();
  return activity;
}

async function updateStatus(
  activityId: string,
  updaterUserId: string,
  newStatus: "published" | "cancelled"
) {
  const activity = await ActivityModel.findById(activityId);
  if (!activity) throw new HttpError(404, "Activity not found");
  const club = await assertIsClubStaffForActivity(updaterUserId, activity);
  activity.status = newStatus;
  await activity.save();
  if (newStatus === "cancelled") {
    NotificationService.broadcastToFollowers(String(club._id), {
      type: "activity_update",
      title: `Activity cancelled: ${activity.title}`,
      body: `An activity from ${club.name} was cancelled.`,
      link_url: `/user/activities`,
    });
  }
  return activity;
}

async function unregisterFromActivity(userId: string, activityId: string) {
  const reg = await ActivityRegistrationModel.findOne({
    activity_id: activityId,
    user_id: userId,
    status: { $ne: "cancelled" },
  });
  if (!reg) throw new HttpError(404, "Registration not found");
  reg.status = "cancelled";
  reg.cancelled_at = new Date();
  await reg.save();
  return reg;
}

async function checkIn(regId: string, staffUserId: string) {
  const reg = await ActivityRegistrationModel.findById(regId);
  if (!reg) throw new HttpError(404, "Registration not found");
  const activity = await ActivityModel.findById(reg.activity_id);
  if (!activity) throw new HttpError(404, "Activity not found");
  await assertIsClubStaffForActivity(staffUserId, activity);
  reg.status = "checked-in";
  reg.checkin_at = new Date();
  await reg.save();
  return reg;
}

async function listActivitiesForClub(staffUserId: string, clubId: string) {
  await assertIsClubStaff(staffUserId, clubId);
  const acts = await ActivityModel.find(
    { club_id: clubId },
    "_id title start_time end_time location capacity status images"
  )
    .sort({ start_time: 1 })
    .lean();
  const ids = acts.map((a) => a._id);
  const regs = await ActivityRegistrationModel.aggregate([
    { $match: { activity_id: { $in: ids }, status: { $ne: "cancelled" } } },
    { $group: { _id: "$activity_id", count: { $sum: 1 } } },
  ]);
  const regMap = new Map<string, number>();
  regs.forEach((r: any) => regMap.set(String(r._id), r.count));
  return acts.map((a) => ({
    _id: a._id,
    title: a.title,
    start_time: a.start_time,
    end_time: a.end_time,
    location: a.location,
    capacity: a.capacity,
    registered: regMap.get(String(a._id)) || 0,
    status: a.status,
    images: a.images || [],
  }));
}

async function getActivityManageView(staffUserId: string, activityId: string) {
  const activity = await ActivityModel.findById(activityId);
  if (!activity) throw new HttpError(404, "Activity not found");
  await assertIsClubStaffForActivity(staffUserId, activity);
  const regs = await ActivityRegistrationModel.find(
    { activity_id: activityId },
    "_id user_id status"
  ).lean();
  const userIds = regs.map((r) => r.user_id);
  const users = await UserModel.find(
    { _id: { $in: userIds } },
    "_id full_name email"
  ).lean();
  const userMap = new Map<string, any>();
  users.forEach((u: any) => userMap.set(String(u._id), u));
  const students = regs.map((r) => ({
    name: userMap.get(String(r.user_id))?.full_name || "",
    email: userMap.get(String(r.user_id))?.email || "",
    status: r.status,
  }));
  const registeredCount = regs.filter((r) => r.status !== "cancelled").length;
  return {
    activity: {
      _id: activity._id,
      title: activity.title,
      subtitle: activity.subtitle || "",
      description: activity.description || "",
      location: activity.location || "",
      start_time: activity.start_time,
      end_time: activity.end_time,
      capacity: activity.capacity,
      status: activity.status,
      images: activity.images || [],
      club_id: activity.club_id,
    },
    registeredCount,
    students,
  };
}
async function listPublicByClub(clubId: string) {
  const now = new Date();
  const acts = await ActivityModel.find(
    { club_id: clubId, status: "published", start_time: { $gte: now } },
    "_id title subtitle description start_time end_time location capacity images status"
  )
    .sort({ start_time: 1 })
    .lean();

  const ids = acts.map((a) => a._id);
  const regs = await ActivityRegistrationModel.aggregate([
    { $match: { activity_id: { $in: ids }, status: { $ne: "cancelled" } } },
    { $group: { _id: "$activity_id", count: { $sum: 1 } } },
  ]);
  const regMap = new Map<string, number>();
  regs.forEach((r: any) => regMap.set(String(r._id), r.count));

  return acts.map((a) => ({
    _id: a._id,
    title: a.title,
    subtitle: a.subtitle || "",
    description: a.description || "",
    start_time: a.start_time,
    end_time: a.end_time,
    location: a.location,
    capacity: a.capacity,
    registered: regMap.get(String(a._id)) || 0,
    images: a.images || [],
    status: a.status,
  }));
}

async function listMyRegistrations(userId: string) {
  const regs = await ActivityRegistrationModel.find(
    { user_id: userId },
    "_id activity_id status checkin_at cancelled_at created_at"
  ).lean();

  if (regs.length === 0) return [];

  const activityIds = [...new Set(regs.map((r: any) => String(r.activity_id)))];

  const activities = await ActivityModel.find(
    { _id: { $in: activityIds } },
    "_id title subtitle description start_time end_time location images status club_id"
  ).lean();

  const clubIds = [...new Set(activities.map((a: any) => String(a.club_id)))];

  const clubs = await ClubModel.find(
    { _id: { $in: clubIds } },
    "_id name cover_image_url tagline"
  ).lean();

  const actMap = new Map<string, any>();
  activities.forEach((a: any) => actMap.set(String(a._id), a));

  const clubMap = new Map<string, any>();
  clubs.forEach((c: any) => clubMap.set(String(c._id), c));

  return regs.map((r: any) => {
    const a = actMap.get(String(r.activity_id));
    const c = a ? clubMap.get(String(a.club_id)) : null;

    return {
      _id: r._id,
      activity_id: r.activity_id,
      status: r.status,
      checkin_at: r.checkin_at,
      cancelled_at: r.cancelled_at,
      created_at: r.created_at,
      activity: a
        ? {
            _id: a._id,
            title: a.title,
            subtitle: a.subtitle || "",
            start_time: a.start_time,
            end_time: a.end_time,
            location: a.location || "",
            images: a.images || [],
            status: a.status,
            club_id: a.club_id,
          }
        : null,
      club: c
        ? {
            _id: c._id,
            name: c.name,
            cover_image_url: c.cover_image_url || "",
            tagline: c.tagline || "",
          }
        : null,
    };
  });
}

async function listPublicFeed() {
  const now = new Date();

  const acts = await ActivityModel.find(
    {
      status: "published",
      start_time: { $gte: now },
    },
    "_id title subtitle description start_time end_time location capacity images status club_id"
  )
    .sort({ start_time: 1 })
    .limit(50)
    .lean();

  const ids = acts.map((a: any) => a._id);

  const regs = await ActivityRegistrationModel.aggregate([
    { $match: { activity_id: { $in: ids }, status: { $ne: "cancelled" } } },
    { $group: { _id: "$activity_id", count: { $sum: 1 } } },
  ]);

  const regMap = new Map<string, number>();
  regs.forEach((r: any) => {
    regMap.set(String(r._id), r.count);
  });

  const clubIds = [...new Set(acts.map((a: any) => String(a.club_id)))];

  const clubs = await ClubModel.find(
    { _id: { $in: clubIds } },
    "_id name cover_image_url"
  ).lean();

  const clubMap = new Map<string, any>();
  clubs.forEach((c: any) => {
    clubMap.set(String(c._id), c);
  });

  return acts.map((a: any) => {
    const club = clubMap.get(String(a.club_id));

    return {
      _id: a._id,
      title: a.title,
      subtitle: a.subtitle || "",
      description: a.description || "",
      start_time: a.start_time,
      end_time: a.end_time,
      location: a.location,
      capacity: a.capacity,
      images: a.images || [],
      status: a.status,
      club_id: a.club_id,
      club_name: club?.name || "",
      club_cover_image_url: club?.cover_image_url || "",
      registered: regMap.get(String(a._id)) || 0,
    };
  });
}

export const ActivityService = {
  createActivity,
  updateDetails,
  updateStatus,
  registerToActivity,
  unregisterFromActivity,
  checkIn,
  listActivitiesForClub,
  getActivityManageView,
  listPublicByClub,
  listMyRegistrations,
  listPublicFeed,
};
