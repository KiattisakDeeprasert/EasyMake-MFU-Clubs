"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { TableCard } from "@/components/admin/TableCard";
import type { StaffPostRow } from "@/services/postsService";

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
};

export function PostsTable({
  posts,
  onEdit,
  onDelete,
}: {
  posts: StaffPostRow[];
  onEdit: (post: StaffPostRow) => void;
  onDelete: (post: StaffPostRow) => void;
}) {
  return (
    <TableCard>
      <table className="w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-600 text-[11px] uppercase tracking-wide">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Published</th>
            <th className="px-4 py-2">Last Update</th>
            <th className="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {posts.map((post) => (
            <motion.tr
              key={String(post._id)}
              variants={rowVariants}
              initial="hidden"
              animate="show"
              className="border-t border-gray-200 bg-white align-top"
            >
              <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>

              <td className="px-4 py-3">
                {post.published ? (
                  <span className="inline-flex items-center rounded-md bg-green-100 text-green-800 text-[11px] font-medium px-2 py-1">
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-gray-200 text-gray-700 text-[11px] font-medium px-2 py-1">
                    Draft
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(post.updated_at))}
              </td>

              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-3">
                  <button className="p-1 text-blue-600 hover:text-blue-700" title="Edit" onClick={() => onEdit(post)}>
                    {/* pencil */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97L7.5 18.79l-4 1 1-4 12.362-12.303Z" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14.5 5.5l4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <button className="p-1 text-red-600 hover:text-red-700" title="Delete" onClick={() => onDelete(post)}>
                    {/* trash */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M4 7h16M10 11v6M14 11v6M9 7V4h6v3M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {posts.length === 0 && (
        <div className="p-6 text-center text-sm text-gray-500">
          No posts yet. <Link className="underline" href="#">Create one</Link>
        </div>
      )}
    </TableCard>
  );
}
