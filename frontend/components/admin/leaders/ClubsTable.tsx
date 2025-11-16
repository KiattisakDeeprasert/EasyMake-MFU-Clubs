"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { TableCard } from "@/components/admin/TableCard";
import { ClubActionDialog } from "@/components/admin/leaders/ClubActionDialog";
import { type ClubApiRow } from "@/services/clubsService";
import { MemberInput } from "./ClubEditFormSection";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

type Props = {
  clubs: ClubApiRow[];
  loading: boolean;
  errorMsg: string;
  onListChange: (next: ClubApiRow[]) => void;
  onActionSuccess?: (msg: string) => void;
  onActionError?: (msg: string) => void;
};

export function ClubsTable({
  clubs,
  loading,
  errorMsg,
  onListChange,
  onActionSuccess,
  onActionError,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<
    "view" | "edit" | "suspend" | "activate" | "delete" | null
  >(null);
  const [selectedClub, setSelectedClub] = useState<ClubApiRow | null>(null);

  const [editClubName, setEditClubName] = useState("");
  const [editLeaderName, setEditLeaderName] = useState("");
  const [editLeaderEmail, setEditLeaderEmail] = useState("");
  const [editLeaderCitizenId, setEditLeaderCitizenId] = useState("");
  const [editMembers, setEditMembers] = useState<MemberInput[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  function hydrateEditFormFromClub(club: ClubApiRow) {
    const leaderFullName = (club as any).leader_full_name || "";
    const leaderEmail = (club as any).leader_email || "";
    const leaderCitizenId = (club as any).leader_citizen_id || "";

    const seedMembers: MemberInput[] = (club as any).members || [
      {
        full_name: leaderFullName,
        email: leaderEmail,
        citizen_id: leaderCitizenId,
      },
      { full_name: "", email: "", citizen_id: "" },
      { full_name: "", email: "", citizen_id: "" },
      { full_name: "", email: "", citizen_id: "" },
      { full_name: "", email: "", citizen_id: "" },
    ];

    while (seedMembers.length < 5) {
      seedMembers.push({ full_name: "", email: "", citizen_id: "" });
    }

    setEditClubName(club.name || "");
    setEditLeaderName(leaderFullName);
    setEditLeaderEmail(leaderEmail);
    setEditLeaderCitizenId(leaderCitizenId);
    setEditMembers(seedMembers);
  }

  function openDialog(
    action: "view" | "edit" | "suspend" | "activate" | "delete",
    club: ClubApiRow
  ) {
    setSelectedClub(club);
    setDialogAction(action);
    setDialogOpen(true);

    if (action === "edit") {
      hydrateEditFormFromClub(club);
      setEditError("");
    }
  }

  function closeDialog() {
    setDialogOpen(false);
    setDialogAction(null);
    setSelectedClub(null);
    setEditSubmitting(false);
    setEditError("");
  }

  function IconMore() {
    return (
      <svg
        className="w-5 h-5 text-gray-500 hover:text-gray-800 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="5" r="1.4" />
        <circle cx="12" cy="12" r="1.4" />
        <circle cx="12" cy="19" r="1.4" />
      </svg>
    );
  }

  return (
    <>
      <TableCard>
        {errorMsg && (
          <div className="text-sm rounded-md px-3 py-2 mb-3 bg-red-50 text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 italic">
            Loading clubs...
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Club Name</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {clubs.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-sm text-gray-500 italic"
                  >
                    No clubs found
                  </td>
                </tr>
              ) : (
                clubs.map((club) => {
                  const clubId = String(club._id);

                  return (
                    <motion.tr
                      key={clubId}
                      className="border-t border-gray-200 bg-white align-top"
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {club.name}
                        {club.tagline && (
                          <div className="text-[11px] text-gray-500 font-normal">
                            {club.tagline}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {club.status === "active" ? (
                          <span className="inline-flex rounded-md bg-green-100 text-green-800 text-[11px] font-medium px-2 py-1">
                            active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-md bg-yellow-100 text-yellow-800 text-[11px] font-medium px-2 py-1">
                            suspended
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button
                              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                              aria-label="Open club actions"
                            >
                              <IconMore />
                            </button>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              side="bottom"
                              align="end"
                              sideOffset={4}
                              asChild
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                  duration: 0.15,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className="z-50 w-48 rounded-lg bg-white border border-gray-200 shadow-[0_12px_40px_rgba(15,23,42,0.12)] py-1"
                              >
                                <DropdownMenu.Item
                                  className="w-full px-3 py-2 cursor-pointer text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  onSelect={() => {
                                    openDialog("view", club);
                                  }}
                                >
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  View details
                                </DropdownMenu.Item>

                                <DropdownMenu.Item
                                  className="w-full px-3 py-2 cursor-pointer text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  onSelect={() => {
                                    openDialog("edit", club);
                                  }}
                                >
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  Edit club & leader
                                </DropdownMenu.Item>

                                {club.status === "active" ? (
                                  <DropdownMenu.Item
                                    className="w-full px-3 py-2 cursor-pointer text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                                    onSelect={() => {
                                      openDialog("suspend", club);
                                    }}
                                  >
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Suspend club
                                  </DropdownMenu.Item>
                                ) : (
                                  <DropdownMenu.Item
                                    className="w-full px-3 py-2 cursor-pointer text-xs text-green-700 hover:bg-green-50 flex items-center gap-2"
                                    onSelect={() => {
                                      openDialog("activate", club);
                                    }}
                                  >
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Activate club
                                  </DropdownMenu.Item>
                                )}
                                <div className="h-px bg-gray-100 my-1" />
                                <DropdownMenu.Item
                                  className="w-full px-3 py-2 cursor-pointer text-xs text-red-700 hover:bg-red-50 flex items-center gap-2"
                                  onSelect={() => {
                                    openDialog("delete", club);
                                  }}
                                >
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                                  Delete club
                                </DropdownMenu.Item>
                              </motion.div>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </TableCard>

      <ClubActionDialog
        open={dialogOpen}
        mode={dialogAction}
        selectedClub={selectedClub}
        editClubName={editClubName}
        setEditClubName={setEditClubName}
        editLeaderName={editLeaderName}
        setEditLeaderName={setEditLeaderName}
        editLeaderEmail={editLeaderEmail}
        setEditLeaderEmail={setEditLeaderEmail}
        editLeaderCitizenId={editLeaderCitizenId}
        setEditLeaderCitizenId={setEditLeaderCitizenId}
        editMembers={editMembers}
        setEditMembers={setEditMembers}
        editSubmitting={editSubmitting}
        setEditSubmitting={setEditSubmitting}
        editError={editError}
        setEditError={setEditError}
        clubs={clubs}
        onListChange={onListChange}
        onClose={closeDialog}
        onActionSuccess={onActionSuccess}
        onActionError={onActionError}
      />
    </>
  );
}
