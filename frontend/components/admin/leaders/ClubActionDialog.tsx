"use client";

import { useCallback } from "react";
import { ActionDialog } from "@/components/admin/leaders/ActionDialog";
import { ClubEditFormSection, MemberInput } from "./ClubEditFormSection";
import {
  suspendClub as apiSuspendClub,
  activateClub as apiActivateClub,
  deleteClub as apiDeleteClub,
  updateClubWithLeader as apiUpdateClubWithLeader,
  type ClubApiRow,
} from "@/services/clubsService";

type DialogMode = "view" | "edit" | "suspend" | "activate" | "delete" | null;

type Props = {
  open: boolean;
  mode: DialogMode;
  selectedClub: ClubApiRow | null;

  editClubName: string;
  setEditClubName: (v: string) => void;

  editLeaderName: string;
  setEditLeaderName: (v: string) => void;

  editLeaderEmail: string;
  setEditLeaderEmail: (v: string) => void;

  editLeaderCitizenId: string;
  setEditLeaderCitizenId: (v: string) => void;

  editMembers: MemberInput[];
  setEditMembers: (
    next: MemberInput[] | ((prev: MemberInput[]) => MemberInput[])
  ) => void;

  editSubmitting: boolean;
  setEditSubmitting: (v: boolean) => void;

  editError: string;
  setEditError: (v: string) => void;

  clubs: ClubApiRow[];
  onListChange: (next: ClubApiRow[]) => void;

  onClose: () => void;
  onActionSuccess?: (msg: string) => void;
  onActionError?: (msg: string) => void;
};

export function ClubActionDialog({
  open,
  mode,
  selectedClub,

  editClubName,
  setEditClubName,
  editLeaderName,
  setEditLeaderName,
  editLeaderEmail,
  setEditLeaderEmail,
  editLeaderCitizenId,
  setEditLeaderCitizenId,
  editMembers,
  setEditMembers,
  editSubmitting,
  setEditSubmitting,
  editError,
  setEditError,

  clubs,
  onListChange,
  onClose,
  onActionSuccess,
  onActionError,
}: Props) {
  const validateBeforeSubmit = useCallback(() => {
    if (!editClubName.trim()) return "Club name is required.";
    if (!editLeaderName.trim()) return "Leader full name is required.";
    if (!editLeaderEmail.trim()) return "Leader email is required.";
    if (!editLeaderCitizenId.trim()) return "Leader citizen ID is required.";

    if (editMembers.length < 5) {
      return "Need at least 5 founding members.";
    }

    for (let i = 0; i < editMembers.length; i++) {
      const m = editMembers[i];
      if (!m.full_name.trim() || !m.email.trim() || !m.citizen_id.trim()) {
        return `Member #${i + 1} is incomplete.`;
      }
    }

    return "";
  }, [
    editClubName,
    editLeaderName,
    editLeaderEmail,
    editLeaderCitizenId,
    editMembers,
  ]);

  const confirm = useCallback(async () => {
    if (!selectedClub || !mode) {
      onClose();
      return;
    }

    if (mode === "view") {
      onClose();
      return;
    }

    // ---------- OPTIMISTIC ACTIONS: suspend / activate / delete ----------
    if (mode === "suspend" || mode === "activate" || mode === "delete") {
      const prevClubs = clubs;

      try {
        let next: ClubApiRow[] = prevClubs;

        if (mode === "suspend") {
          next = prevClubs.map((c) =>
            c._id === selectedClub._id
              ? { ...c, status: "suspended" as const }
              : c
          );
          onListChange(next);
          onActionSuccess?.(`Club "${selectedClub.name}" suspended.`);
          onClose();

          // fire API background
          await apiSuspendClub(selectedClub._id);
        } else if (mode === "activate") {
          next = prevClubs.map((c) =>
            c._id === selectedClub._id
              ? { ...c, status: "active" as const }
              : c
          );
          onListChange(next);
          onActionSuccess?.(`Club "${selectedClub.name}" activated.`);
          onClose();

          await apiActivateClub(selectedClub._id);
        } else if (mode === "delete") {
          next = prevClubs.filter((c) => c._id !== selectedClub._id);
          onListChange(next);
          onActionSuccess?.(`Club "${selectedClub.name}" deleted.`);
          onClose();

          await apiDeleteClub(selectedClub._id);
        }

        return;
      } catch (err: any) {
        console.error(err);
        // rollback
        onListChange(clubs);
        onActionError?.(
          err?.message || "Something went wrong performing action."
        );
        return;
      }
    }

    // ---------- EDIT MODE ----------
    if (mode === "edit") {
      if (editSubmitting) return;

      const validationMsg = validateBeforeSubmit();
      if (validationMsg) {
        setEditError(validationMsg);
        return;
      }

      try {
        setEditSubmitting(true);
        setEditError("");

        await apiUpdateClubWithLeader(selectedClub._id, {
          clubName: editClubName,
          leaderName: editLeaderName,
          leaderEmail: editLeaderEmail,
          leaderCitizenId: editLeaderCitizenId,
          members: editMembers.map((m) => ({
            name: m.full_name,
            email: m.email,
            citizenId: m.citizen_id,
          })),
        });

        const next = clubs.map((c) =>
          c._id === selectedClub._id
            ? {
                ...c,
                name: editClubName,
                leader_full_name: editLeaderName,
                leader_email: editLeaderEmail,
                leader_citizen_id: editLeaderCitizenId,
                members: editMembers.map((m) => ({
                  full_name: m.full_name,
                  email: m.email,
                  citizen_id: m.citizen_id,
                })),
              }
            : c
        );
        onListChange(next);

        onActionSuccess?.(`Club "${editClubName}" updated.`);
        setEditSubmitting(false);
        onClose();
      } catch (err: any) {
        console.error(err);
        onActionError?.(
          err?.message || "Something went wrong performing action."
        );
        setEditSubmitting(false);
      }
      return;
    }

    onClose();
  }, [
    mode,
    selectedClub,
    clubs,
    onListChange,
    onClose,
    onActionSuccess,
    onActionError,
    editSubmitting,
    editClubName,
    editLeaderName,
    editLeaderEmail,
    editLeaderCitizenId,
    editMembers,
    validateBeforeSubmit,
    setEditError,
    setEditSubmitting,
  ]);

  let dialogTitle = "Club Details";
  let dialogDesc = selectedClub ? `${selectedClub.name}` : "";
  let confirmLabel = "Close";
  let confirmTone: "default" | "danger" = "default";

  if (mode === "suspend") {
    dialogTitle = "Suspend Club";
    dialogDesc = selectedClub
      ? `Suspend "${selectedClub.name}"? The club will lose access to admin tools.`
      : "";
    confirmLabel = "Suspend";
  } else if (mode === "activate") {
    dialogTitle = "Activate Club";
    dialogDesc = selectedClub
      ? `Bring "${selectedClub.name}" back online?`
      : "";
    confirmLabel = "Activate";
  } else if (mode === "delete") {
    dialogTitle = "Delete Club";
    dialogDesc = selectedClub
      ? `This will permanently remove “${selectedClub.name}”. This cannot be undone.`
      : "";
    confirmLabel = "Delete Permanently";
    confirmTone = "danger";
  } else if (mode === "edit") {
    dialogTitle = "Edit Club";
    dialogDesc = "Update club info, leader, and founding members.";
    confirmLabel = editSubmitting ? "Saving..." : "Save Changes";
  }

  function renderBody() {
    if (!selectedClub || !mode) return null;

    if (mode === "view") {
      return (
        <div className="text-[13px] leading-relaxed space-y-4">
          <div className="space-y-1">
            <div className="text-gray-800 font-semibold text-sm">
              Club Information
            </div>
            <div>
              <span className="font-medium text-gray-700">Club:</span>{" "}
              {selectedClub.name}
            </div>
            {selectedClub.tagline && (
              <div>
                <span className="font-medium text-gray-700">Tagline:</span>{" "}
                {selectedClub.tagline}
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Status:</span>{" "}
              {selectedClub.status === "active" ? "Active" : "Suspended"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-800 font-semibold text-sm">Leader</div>
            <div className="text-[13px] text-gray-800">
              {(selectedClub as any).leader_full_name || "—"} (
              {(selectedClub as any).leader_email || "—"})
            </div>
            <div className="text-[12px] text-gray-500">
              Citizen ID:{" "}
              {(selectedClub as any).leader_citizen_id || "—"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-800 font-semibold text-sm">
              Founding Members
            </div>
            <div className="text-[12px] text-gray-600 leading-relaxed">
              {Array.isArray((selectedClub as any).members) &&
              (selectedClub as any).members.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {(selectedClub as any).members.map(
                    (m: any, idx: number) => (
                      <li key={idx}>
                        <span className="text-gray-800 font-medium">
                          {m.full_name || "—"}
                        </span>{" "}
                        <span className="text-gray-500">
                          ({m.email || "—"})
                        </span>{" "}
                        <span className="text-gray-400">
                          #{m.citizen_id || "—"}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <div className="italic text-gray-400">
                  (no members data)
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (mode === "edit") {
      return (
        <ClubEditFormSection
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
          editError={editError}
        />
      );
    }

    if (mode === "suspend") {
      return (
        <div className="text-[13px] leading-relaxed space-y-2 text-amber-600">
          <div className="font-semibold">
            This club will be temporarily disabled.
          </div>
          <div className="text-gray-700">
            Club:{" "}
            <span className="font-semibold text-gray-900">
              {selectedClub.name}
            </span>
          </div>
          <div className="text-gray-700">
            Current status:{" "}
            <span className="font-semibold text-gray-900">
              {selectedClub.status}
            </span>
          </div>
        </div>
      );
    }

    if (mode === "activate") {
      return (
        <div className="text-[13px] leading-relaxed space-y-2 text-green-600">
          <div className="font-semibold">
            This club will be re-activated.
          </div>
          <div className="text-gray-700">
            Club:{" "}
            <span className="font-semibold text-gray-900">
              {selectedClub.name}
            </span>
          </div>
          <div className="text-gray-700">
            Current status:{" "}
            <span className="font-semibold text-gray-900">
              {selectedClub.status}
            </span>
          </div>
        </div>
      );
    }

    if (mode === "delete") {
      return (
        <div className="text-[13px] leading-relaxed space-y-2 text-red-600">
          <div className="font-semibold">This action is permanent.</div>
          <div className="text-gray-700">
            Club:{" "}
            <span className="font-semibold text-gray-900">
              {selectedClub.name}
            </span>
          </div>
          <div className="text-gray-700">
            Leader User ID:{" "}
            <span className="font-semibold text-gray-900">
              {selectedClub.leader_user_id || "—"}
            </span>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <ActionDialog
      open={open}
      mode={mode}
      title={dialogTitle}
      description={dialogDesc}
      confirmLabel={confirmLabel}
      confirmTone={confirmTone}
      onClose={onClose}
      onConfirm={confirm}
    >
      {renderBody()}
    </ActionDialog>
  );
}
