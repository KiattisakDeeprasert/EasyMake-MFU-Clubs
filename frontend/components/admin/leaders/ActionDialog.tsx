"use client";

import { motion, AnimatePresence } from "framer-motion";

type ActionDialogProps = {
  open: boolean;
  mode: "view" | "edit" | "suspend" | "activate" | "delete" | null;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmTone?: "default" | "danger";
  onClose: () => void;
  onConfirm?: () => void;
  children?: React.ReactNode;

  confirmDisabled?: boolean;
};

export function ActionDialog({
  open,
  mode,
  title,
  description,
  confirmLabel = "Confirm",
  confirmTone = "default",
  onClose,
  onConfirm,
  children,
  confirmDisabled = false, 
}: ActionDialogProps) {
  const isViewOnly = mode === "view";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Center wrapper */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Panel */}
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-white text-gray-900 shadow-[0_24px_80px_-10px_rgba(0,0,0,0.4)] border border-gray-200 rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  {title}
                </h3>
                {description && (
                  <p className="text-[13px] text-gray-500 leading-relaxed mt-1">
                    {description}
                  </p>
                )}
              </div>

              {/* Body */}
              {children && (
                <div className="p-6 bg-gray-50/60 text-[13px] text-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto">
                  {children}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-white">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-[13px] rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                >
                  {isViewOnly ? "Close" : "Cancel"}
                </button>

                {!isViewOnly && (
                  <button
                    onClick={confirmDisabled ? undefined : onConfirm}
                    disabled={confirmDisabled}
                    className={`px-3 py-1.5 text-[13px] rounded-md font-medium
                      ${
                        confirmTone === "danger"
                          ? "bg-red-600 text-white hover:bg-red-500"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }
                      ${
                        confirmDisabled
                          ? "opacity-60 cursor-not-allowed hover:bg-gray-900 hover:bg-red-600"
                          : ""
                      }
                    `}
                  >
                    {confirmLabel}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
