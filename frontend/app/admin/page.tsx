"use client";

import { motion, Variants } from "framer-motion";
import { useRole } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function AdminDashboardPage() {
  const role = useRole();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut", // ✅ เปลี่ยนจาก array มาใช้ string ที่ type รองรับชัวร์
      },
    },
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Quick actions based on your admin role.
        </p>
      </motion.header>

      {/* Role-specific Quick Cards */}
      {role === "club-leader" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <motion.div variants={itemVariants}>
            <QuickCard
              title="Manage Club Profile"
              desc="Edit club name, tagline, description, contact, and cover image."
              href="/admin/my-club/profile"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickCard
              title="Manage Activities"
              desc="Create activities, update schedules, and track attendees."
              href="/admin/my-club/activities"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickCard
              title="Posts & Announcements"
              desc="Publish updates to your members and followers."
              href="/admin/my-club/posts"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickCard
              title="Members & Followers"
              desc="View student followers of your club."
              href="/admin/my-club/members"
            />
          </motion.div>
        </motion.div>
      )}

      {role === "super-admin" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <QuickCard
              title="All Clubs Overview"
              desc="View every club's status, leader, and membership."
              href="/admin/system/clubs"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickCard
              title="Club Leaders (CRUD)"
              desc="Create, update and manage club leadership."
              href="/admin/system/leaders"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickCard
              title="Reports & Issues"
              desc="Handle reported posts, clubs or activities."
              href="/admin/system/reports"
            />
          </motion.div>
        </motion.div>
      )}

      {!role && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-500 flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          Loading role...
        </motion.div>
      )}
    </section>
  );
}

function QuickCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="
          block rounded-xl border border-gray-200 bg-white p-5 
          hover:border-blue-300 hover:shadow-lg 
          transition-all duration-200 cursor-pointer relative overflow-hidden
        "
      >
        {/* Subtle hover glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative space-y-1">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{desc}</p>

          <motion.div
            className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-2"
            whileHover={{ x: 4 }}
          >
            Go <ArrowRight className="w-3 h-3" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
