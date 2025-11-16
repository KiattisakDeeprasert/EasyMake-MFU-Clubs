"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLoginCard } from "@/components/admin/AdminLoginCard";
import { loginRequest } from "@/services/authService";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cookieRole = getCookie("role");
    if (
      cookieRole === "super-admin" ||
      cookieRole === "club-leader" ||
      cookieRole === "co-leader"
    ) {
      router.replace("/admin/");
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return; 
    setSubmitting(true);
    setError("");

    try {
      const result = await loginRequest(email, password);

      if (
        result.user.role !== "super-admin" &&
        result.user.role !== "club-leader" &&
        result.user.role !== "co-leader"
      ) {
        setError("You are not allowed to access admin dashboard.");
        setSubmitting(false);
        return;
      }

      const maxAge = 7 * 24 * 60 * 60;

      document.cookie = `role=${result.user.role}; path=/; max-age=${maxAge}`;
      document.cookie = `email=${encodeURIComponent(
        result.user.email
      )}; path=/; max-age=${maxAge}`;

      if (result.user.clubId) {
        document.cookie = `clubId=${result.user.clubId}; path=/; max-age=${maxAge}`;
      } else {
        document.cookie = `clubId=; path=/; max-age=0`;
      }

      router.replace("/admin/");
    } catch (err: any) {
      setError(err.message || "Login failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AdminLoginCard
          email={email}
          password={password}
          submitting={submitting}
          error={error}
          onEmailChange={(v) => {
            setEmail(v);
            if (error) setError("");
          }}
          onPasswordChange={(v) => {
            setPassword(v);
            if (error) setError("");
          }}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
