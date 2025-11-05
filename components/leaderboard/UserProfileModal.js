"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { useState } from "react";

export default function UserProfileModal({
  user,
  isOpen,
  onClose,
  onSendFriendRequest,
  currentUserId,
}) {
  const [isRequestSending, setIsRequestSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleSendRequest = async () => {
    setIsRequestSending(true);
    setError("");
    try {
      await onSendFriendRequest(user.userId);
      setRequestSent(true);
    } catch (error) {
      console.error("Failed to send friend request:", error);
      setError(error.message || "Failed to send friend request");
    } finally {
      setIsRequestSending(false);
    }
  };

  const isCurrentUser = user.userId?.toString() === currentUserId;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* Header Section */}
              <div className="text-center pt-8 pb-6 px-6 border-b border-gray-100">
                {/* Avatar */}
                <div className="inline-block mb-4">
                  <div className="w-17 h-17 rounded-full bg-gradient-to-br from-gray-800 to-black/50 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-gray-100">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-17 h-17 rounded-full object-cover"
                      />
                    ) : (
                      <span>{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>

                {/* Name and Username */}
                <h3 className="text-xl font-bold text-black mb-1">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">@{user.username}</p>

                {/* Tags Row */}
                <div className="flex items-center justify-center gap-2">
                  {user.country && (
                    <div className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {user.country}
                    </div>
                  )}
                  <div className="px-2.5 py-1 bg-black/10 text-black rounded-full text-xs font-semibold">
                    Level {user.level || 1}
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 py-4 px-4">
                <div className="text-center px-2">
                  <p className="text-2xl font-bold text-black/50 mb-0.5">
                    #{user.rank}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Rank
                  </p>
                </div>
                <div className="text-center px-2">
                  <p className="text-2xl font-bold text-black/50 mb-0.5">
                    {user.level || 1}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Level
                  </p>
                </div>
                <div className="text-center px-2">
                  <p className="text-2xl font-bold text-black/50 mb-0.5">
                    {(user.totalXP || user.xp || 0) >= 1000
                      ? `${((user.totalXP || user.xp || 0) / 1000).toFixed(1)}k`
                      : (user.totalXP || user.xp || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    XP
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 border-t border-gray-100">
                {!isCurrentUser && (
                  <>
                    {error && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
                        {error}
                      </div>
                    )}
                    <button
                      onClick={handleSendRequest}
                      disabled={isRequestSending || requestSent}
                      className={`w-full py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                        requestSent
                          ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                          : "bg-black/90 text-white hover:bg-gray-800 active:scale-95"
                      } disabled:opacity-50`}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {requestSent
                          ? "Request Sent"
                          : isRequestSending
                            ? "Sending..."
                            : "Add Friend"}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
