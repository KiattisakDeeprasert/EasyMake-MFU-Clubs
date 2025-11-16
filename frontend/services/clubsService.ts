import { authedFetch, BASE_URL } from "./http";

export type ClubApiRow = {
  _id: string;
  name: string;
  tagline?: string;
  leader_user_id?: string;
  status: "active" | "suspended";
  leader_full_name?: string;
  leader_email?: string;
  leader_citizen_id?: string;
  members?: Array<{
    user_id?: string;
    full_name: string;
    email: string;
    citizen_id: string;
  }>;
};

export type PublicActivity = {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time?: string;
  capacity: number;
  registered: number;
  images: string[];
  status: "published" | "cancelled";
  is_registered?: boolean;
  registration_locked_for_me?: boolean;
};

export type ClubPublic = {
  _id: string;
  name: string;
  tagline?: string;
  description?: string;
  status: "active" | "suspended";
  cover_image_url?: string;
  members?: ClubMemberSnapshot[];
  followerCount?: number;
};

export type ClubContactChannel = {
  platform: string;
  handle: string;
};

export type ClubMemberSnapshot = {
  user_id?: string;
  full_name: string;
  email: string;
  citizen_id: string;
  joined_at?: string;
};

export type ClubDetail = {
  _id: string;
  name: string;
  description?: string;
  tagline?: string;
  cover_image_url?: string;
  status: "active" | "suspended";
  is_following?: boolean;
   contact_channels?: ClubContactChannel[];
  members?: ClubMemberSnapshot[];
};

export type FollowingClub = {
  _id: string;
  name: string;
  cover_image_url?: string;
  tagline?: string;
  followerCount?: number;
};

export async function getAllClubs(): Promise<{ clubs: ClubApiRow[] }> {
  const data = await authedFetch("/clubs", { method: "GET" });
  return data as { clubs: ClubApiRow[] };
}

export async function getPublicClubs(): Promise<{ clubs: ClubPublic[] }> {
  const res = await fetch(`${BASE_URL}/clubs/public`, { cache: "no-store" });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Failed to load clubs (${res.status})`);
  }

  const data = (await res.json()) as { clubs: any[] };

  const clubs: ClubPublic[] = (data.clubs || []).map((c) => ({
    ...c,
    followerCount:
      typeof c.followerCount === "number"
        ? c.followerCount
        : Array.isArray(c.members)
        ? c.members.length
        : 0,
  }));

  return { clubs };
}


export async function getClubPublic(clubId: string): Promise<{ club: ClubDetail }> {
  const res = await fetch(`${BASE_URL}/clubs/${clubId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load club (${res.status})`);
  return res.json();
}

export async function getClubPublicActivities(clubId: string): Promise<{ activities: PublicActivity[] }> {
  const res = await fetch(`${BASE_URL}/activities/public/by-club/${clubId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load activities (${res.status})`);
  return res.json();
}

export async function suspendClub(clubId: string) {
  return authedFetch(`/clubs/${clubId}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({ reason: "Suspended by admin" }),
  });
}

export async function activateClub(clubId: string) {
  return authedFetch(`/clubs/${clubId}/activate`, {
    method: "PATCH",
    body: JSON.stringify({ reason: "Re-activated by admin" }),
  });
}

export async function deleteClub(clubId: string) {
  return authedFetch(`/clubs/${clubId}`, {
    method: "DELETE",
  });
}

export async function registerClubWithLeader(payload: {
  clubName: string;
  leaderName: string;
  leaderEmail: string;
  leaderCitizenId: string;
  members: { name: string; email: string; citizenId: string }[];
}) {
  return authedFetch("/clubs/admin/create-club-with-leader", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateClubWithLeader(
  clubId: string,
  payload: {
    clubName: string;
    leaderName: string;
    leaderEmail: string;
    leaderCitizenId: string;
    members: { name: string; email: string; citizenId: string }[];
  }
) {
  return authedFetch(`/clubs/${clubId}/update-with-leader`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getClubFollowStatus(
  clubId: string
): Promise<{ isFollowing: boolean }> {
  const data = await authedFetch(`/clubs/${clubId}/follow-status`, {
    method: "GET",
  });
  return data as { isFollowing: boolean };
}

export async function followClub(clubId: string) {
  return authedFetch(`/clubs/${clubId}/follow`, { method: "POST" });
}

export async function unfollowClub(clubId: string) {
  return authedFetch(`/clubs/${clubId}/unfollow`, { method: "POST" });
}

export async function getMyFollowingClubs(): Promise<FollowingClub[]> {
  const data = await authedFetch(`/me/following/clubs`, {
    method: "GET",
  });
  return (data.clubs || []) as FollowingClub[];
}

export type ClubMemberRow = {
  user_id?: string;
  full_name: string;
  email: string;
  citizen_id?: string;
  joined_at?: string;
};

export async function getClubMembers(
  clubId: string
): Promise<ClubMemberRow[]> {
  const data = await authedFetch(`/clubs/${clubId}/followers`, {
    method: "GET",
  });
  return (data.members || []) as ClubMemberRow[];
}
