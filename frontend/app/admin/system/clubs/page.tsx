"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { useRouter } from "next/navigation";
import { getAllClubs, type ClubApiRow } from "@/services/clubsService";
import { ClubsTable } from "@/components/admin/leaders/ClubsTable";

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.08 },
  },
};

export default function SystemClubsPage() {
  const router = useRouter();

  const [clubs, setClubs] = useState<ClubApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [banner, setBanner] = useState<{
    tone: "success" | "error";
    msg: string;
  } | null>(null);

  // initial fetch
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllClubs();
        setClubs(data.clubs || []);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to fetch clubs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // auto-hide banner 5 วินาที
  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => {
      setBanner(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  function handleListChange(next: ClubApiRow[]) {
    setClubs(next);
  }

  function handleActionSuccess(msg: string) {
    setBanner({ tone: "success", msg });
  }

  function handleActionError(msg: string) {
    setBanner({ tone: "error", msg });
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <SectionHeader
        title="All Clubs"
        subtitle="Overview of every registered club."
        action={
          <button
            onClick={() => router.push("/admin/system/leaders")}
            className="px-3 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
          >
            + Register New Club
          </button>
        }
      />

      {/* fancy banner */}
      {banner && (
        <motion.div
          key={banner.msg + banner.tone}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`
            relative overflow-hidden rounded-xl border px-4 py-3 text-sm
            ${banner.tone === "success"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-800"
              : "border-rose-200 bg-rose-50/80 text-rose-800"}
          `}
        >
          {/* accent bar */}
          <div
            className={`
              absolute inset-y-0 left-0 w-1
              ${banner.tone === "success" ? "bg-emerald-400" : "bg-rose-400"}
            `}
          />

          <div className="ml-3 flex items-start gap-3">
            <div
              className={`
                mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                ${banner.tone === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"}
              `}
            >
              {banner.tone === "success" ? "✓" : "!"}
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {banner.tone === "success" ? "Action completed" : "Action failed"}
              </p>
              <p className="mt-0.5 text-sm">{banner.msg}</p>
            </div>

            <button
              className="ml-2 mt-0.5 text-xs text-gray-400 hover:text-gray-600"
              onClick={() => setBanner(null)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {errorMsg && !banner && (
        <div className="text-sm rounded-md px-3 py-2 bg-red-50 text-red-700 border border-red-200">
          {errorMsg}
        </div>
      )}

      <ClubsTable
        clubs={clubs}
        loading={loading}
        errorMsg={errorMsg}
        onListChange={handleListChange}
        onActionSuccess={handleActionSuccess}
        onActionError={handleActionError}
      />
    </motion.section>
  );
}
