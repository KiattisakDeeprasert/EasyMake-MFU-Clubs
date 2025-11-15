import { BASE_URL } from "./http";

export type LoginSuccessResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: "super-admin" | "club-leader" | "co-leader" | "user";
    full_name?: string;
    is_active: boolean;
    clubId?: string | null;
  };
};

export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let message = "Login failed";
    try {
      const data = await res.json();
      if (data && data.message) {
        message = data.message;
      }
    } catch {}
    throw new Error(message);
  }

  const data: LoginSuccessResponse = await res.json();
  return data;
}

export async function loginWithGoogleIdToken(idToken: string) {
  const res = await fetch(`${BASE_URL}/auth/oauth/google-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Login failed");
  }
  const data: LoginSuccessResponse = await res.json();
  return data;
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}