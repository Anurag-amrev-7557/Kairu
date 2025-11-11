"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import useFriendStore from "@/lib/store/friendStore";
import { useSession } from "next-auth/react";
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  Clock,
  Trash2,
  Mail,
  Trophy,
  Flame,
  Target,
  ChevronDown,
  Loader2,
  UserMinus,
  Send,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const TABS = {
  FRIENDS: "friends",
  REQUESTS: "requests",
  FIND: "find",
};

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState(TABS.FRIENDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const {
    friends,
    pendingRequests,
    sentRequests,
    searchResults,
    loading,
    searchLoading,
    error,
    fetchFriends,
    fetchPendingRequests,
    fetchSentRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    clearSearchResults,
    clearError,
  } = useFriendStore();

  const { data: session } = useSession();

  // Fetch initial data
  useEffect(() => {
    if (session?.user?.token) {
      fetchFriends(session.user.token).catch(console.error);
      fetchPendingRequests(session.user.token).catch(console.error);
      fetchSentRequests(session.user.token).catch(console.error);
    }
  }, [session]);

  // Refresh data when switching tabs
  useEffect(() => {
    if (session?.user?.token) {
      if (activeTab === TABS.FRIENDS) {
        fetchFriends(session.user.token).catch(console.error);
      } else if (activeTab === TABS.REQUESTS) {
        fetchPendingRequests(session.user.token).catch(console.error);
        fetchSentRequests(session.user.token).catch(console.error);
      }
    }
  }, [activeTab, session]);

  // Periodic polling for new requests (every 30 seconds)
  useEffect(() => {
    if (!session?.user?.token) return;

    const interval = setInterval(() => {
      fetchPendingRequests(session.user.token).catch(console.error);
      fetchSentRequests(session.user.token).catch(console.error);
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [session]);

  // Search users with debounce
  useEffect(() => {
    if (activeTab === TABS.FIND && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        if (session?.user?.token) {
          searchUsers(searchQuery, session.user.token).catch(console.error);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (searchQuery.length < 2) {
      clearSearchResults();
    }
  }, [searchQuery, activeTab, session]);

  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId, session.user.token);
      // Refresh sent requests to reflect the new request
      await fetchSentRequests(session.user.token);
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await acceptFriendRequest(userId, session.user.token);
      // Refresh all lists
      await Promise.all([
        fetchFriends(session.user.token),
        fetchPendingRequests(session.user.token),
        fetchSentRequests(session.user.token),
      ]);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await rejectFriendRequest(userId, session.user.token);
      // Refresh pending requests
      await fetchPendingRequests(session.user.token);
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      await removeFriend(userId, session.user.token);
      setShowConfirmDialog(false);
      setActionTarget(null);
      // Refresh friends list
      await fetchFriends(session.user.token);
    } catch (error) {
      console.error("Failed to remove friend:", error);
    }
  };

  const handleRefreshRequests = async () => {
    if (session?.user?.token) {
      await Promise.all([
        fetchPendingRequests(session.user.token),
        fetchSentRequests(session.user.token),
      ]);
    }
  };

  const openConfirmDialog = (user, action) => {
    setActionTarget({ user, action });
    setShowConfirmDialog(true);
  };

  const pendingCount = pendingRequests.length;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Friends</h1>
            <p className="text-gray-500 text-sm">
              Connect with others, share progress, and stay motivated together
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-full p-1">
            {[
              { id: TABS.FRIENDS, label: "My Friends", icon: Users },
              {
                id: TABS.REQUESTS,
                label: "Requests",
                icon: Mail,
                badge: pendingCount,
              },
              { id: TABS.FIND, label: "Find", icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2.5 rounded-full transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-black rounded-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <div className="flex items-center gap-2 relative z-10">
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="rounded-2xl border border-gray-200 p-6">
          <AnimatePresence mode="wait">
            {/* My Friends Tab */}
            {activeTab === TABS.FRIENDS && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No friends yet
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Start by finding and connecting with other users
                    </p>
                    <button
                      onClick={() => setActiveTab(TABS.FIND)}
                      className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
                    >
                      Find Friends
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friendship) => {
                      if (!friendship.friend) return null;
                      return (
                        <FriendCard
                          key={friendship._id}
                          user={friendship.friend}
                          onRemove={() =>
                            openConfirmDialog(friendship.friend, "remove")
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Requests Tab */}
            {activeTab === TABS.REQUESTS && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Received Requests */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      Received Requests
                    </h3>
                    <div className="flex items-center gap-2">
                      {pendingRequests.length > 0 && (
                        <span className="px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                          {pendingRequests.length}
                        </span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 180 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefreshRequests}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh requests"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                      </motion.button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        No pending requests
                      </h4>
                      <p className="text-sm text-gray-500">
                        Friend requests you receive will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingRequests.map((request) => {
                        if (!request.friend) return null;
                        return (
                          <RequestCard
                            key={request._id}
                            user={request.friend}
                            onAccept={() =>
                              handleAcceptRequest(request.friend._id)
                            }
                            onReject={() =>
                              handleRejectRequest(request.friend._id)
                            }
                            type="received"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <Send className="w-4 h-4 text-gray-700" />
                      </div>
                      Sent Requests
                    </h3>
                    {sentRequests.length > 0 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                        {sentRequests.length}
                      </span>
                    )}
                  </div>

                  {sentRequests.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        No sent requests
                      </h4>
                      <p className="text-sm text-gray-500">
                        Friend requests you send will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sentRequests.map((request) => (
                        <RequestCard
                          key={request._id}
                          user={request.friend}
                          onCancel={async () => {
                            await removeFriend(
                              request.friend._id,
                              session.user.token,
                            );
                            // Refresh sent requests
                            await fetchSentRequests(session.user.token);
                          }}
                          type="sent"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Find Friends Tab */}
            {activeTab === TABS.FIND && (
              <motion.div
                key="find"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm font-medium placeholder:text-gray-400"
                    />
                    {searchLoading && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Type at least 2 characters to search
                    </p>
                    {searchResults.length > 0 && (
                      <p className="text-xs font-medium text-gray-700">
                        {searchResults.length}{" "}
                        {searchResults.length === 1 ? "user" : "users"} found
                      </p>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                {searchQuery.length < 2 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Discover New Connections
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      Search for friends by their name or email address and
                      start building your network
                    </p>
                  </div>
                ) : searchLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500">Searching users...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No Results Found
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
                      We couldn't find anyone matching "
                      <span className="font-semibold text-gray-700">
                        {searchQuery}
                      </span>
                      "
                    </p>
                    <p className="text-xs text-gray-400">
                      Try searching with a different name or email address
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Search Results
                      </h3>
                      <span className="text-xs text-gray-500">
                        {searchResults.length}{" "}
                        {searchResults.length === 1 ? "match" : "matches"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <SearchResultCard
                          key={user._id}
                          user={user}
                          onSendRequest={() => handleSendRequest(user._id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirmDialog && actionTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowConfirmDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 z-50"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Remove Friend?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to remove{" "}
                <span className="font-medium">{actionTarget.user.name}</span>{" "}
                from your friends list?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveFriend(actionTarget.user._id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Friend Card Component
function FriendCard({ user, onRemove }) {
  const [showActions, setShowActions] = useState(false);

  if (!user) return null;

  const getAvatarGradient = () => {
    const gradients = [
      "from-blue-500 to-purple-500",
      "from-pink-500 to-rose-500",
      "from-green-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-blue-500",
      "from-purple-500 to-pink-500",
    ];
    const index = (user.name?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white border border-gray-200 rounded-2xl p-3 hover:shadow-md hover:border-black transition-all relative group"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-full ${!user.avatar_url ? `bg-gradient-to-br ${getAvatarGradient()}` : "bg-gray-100"} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative`}
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name || "User"}
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            user.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">
            {user.name}
          </h4>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3" />
            {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200">
            <Trophy className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-gray-900">
              {user.profile?.level || 1}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200">
            <Flame className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-gray-900">
              {user.profile?.streak_days || 0}d
            </span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200">
            <Target className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-gray-900">
              {Math.round(user.profile?.total_focus_hours || 0)}h
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                showActions ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          <AnimatePresence>
            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-full shadow-2xl overflow-hidden z-20"
                >
                  <button
                    onClick={() => {
                      onRemove();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Friend
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Request Card Component
function RequestCard({ user, onAccept, onReject, onCancel, type }) {
  if (!user) return null;

  const getAvatarGradient = () => {
    if (type === "received") return "from-green-500 to-emerald-500";
    return "from-gray-400 to-gray-600";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-3 hover:border-black hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-full ${!user.avatar_url ? `bg-gradient-to-br ${getAvatarGradient()}` : "bg-gray-100"} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative`}
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name || "User"}
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            user.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">
            {user.name}
          </h4>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3" />
            {user.email}
          </p>
        </div>

        {/* Actions */}
        {type === "received" ? (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-sm font-medium text-xs flex items-center gap-1.5"
              title="Accept"
            >
              <Check className="w-4 h-4" />
              Accept
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReject}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all border border-gray-200 font-medium text-xs flex items-center gap-1.5"
              title="Reject"
            >
              <X className="w-4 h-4" />
              Decline
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-gray-600 px-3 py-1.5 bg-gray-50 rounded-full flex items-center gap-1.5 border border-gray-200">
              <Clock className="w-3.5 h-3.5" />
              Pending
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 font-medium text-xs"
              title="Cancel"
            >
              Cancel
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Search Result Card Component
function SearchResultCard({ user, onSendRequest }) {
  if (!user) return null;

  const getAvatarGradient = () => {
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-purple-500 to-indigo-500",
      "from-cyan-500 to-blue-500",
      "from-amber-500 to-orange-500",
      "from-emerald-500 to-green-500",
      "from-violet-500 to-purple-500",
    ];
    const index = (user.name?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  const getFriendshipButton = () => {
    if (!user.friendship) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSendRequest}
          className="px-3 py-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all text-xs font-medium flex items-center gap-1.5 shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add
        </motion.button>
      );
    }

    if (user.friendship.status === "pending") {
      if (user.friendship.is_requester) {
        return (
          <div className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1.5 border border-gray-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </div>
        );
      } else {
        return (
          <div className="px-3 py-1.5 bg-black text-white rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <Mail className="w-3.5 h-3.5" />
            Respond
          </div>
        );
      }
    }

    if (user.friendship.status === "accepted") {
      return (
        <div className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
          <Check className="w-3.5 h-3.5" />
          Friends
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-gray-200 rounded-xl p-3 hover:border-black hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-full ${!user.avatar_url ? `bg-gradient-to-br ${getAvatarGradient()}` : "bg-gray-100"} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative`}
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.name || "User"}
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            user.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">
            {user.name}
          </h4>
          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3" />
            {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200">
            <Trophy className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-gray-900">
              {user.profile?.level || 1}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200">
            <Flame className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-gray-900">
              {user.profile?.streak_days || 0}d
            </span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full border border-gray-200">
            <Target className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-gray-900">
              {Math.round(user.profile?.total_focus_hours || 0)}h
            </span>
          </div>
        </div>

        {/* Action Button */}
        {getFriendshipButton()}
      </div>
    </motion.div>
  );
}
