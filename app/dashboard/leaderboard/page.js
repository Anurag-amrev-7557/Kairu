"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Zap,
  Award,
  ChevronDown,
  Globe,
  UserCheck,
  MapPin,
} from "lucide-react";
import { useSession } from "next-auth/react";
import countries from "@/lib/countries";
import UserProfileModal from "@/components/leaderboard/UserProfileModal";

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("xp");
  const [selectedPeriod, setSelectedPeriod] = useState("all_time");
  const [selectedScope, setSelectedScope] = useState("global");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [availableCountries, setAvailableCountries] = useState([]);
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const metrics = [
    { id: "xp", label: "Experience Points", icon: Zap },
    { id: "focus_time", label: "Focus Time", icon: Clock },
    { id: "streak", label: "Best Streak", icon: Flame },
    { id: "tasks_completed", label: "Tasks Completed", icon: CheckCircle },
  ];

  const periods = [
    { id: "all_time", label: "All Time" },
    { id: "month", label: "This Month" },
    { id: "week", label: "This Week" },
  ];

  const scopes = [
    { id: "global", label: "Global", icon: Globe },
    { id: "friends", label: "Friends", icon: UserCheck },
    { id: "country", label: "Country", icon: MapPin },
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedMetric, selectedPeriod, selectedScope, selectedCountry, session]);

  // Fetch countries when switching to country scope
  useEffect(() => {
    if (selectedScope === "country" && availableCountries.length === 0) {
      fetchLeaderboard();
    }
  }, [selectedScope]);

  const fetchLeaderboard = async () => {
    if (!session?.user?.token) return;

    setLoading(true);
    try {
      let url = `/api/leaderboard?metric=${selectedMetric}&period=${selectedPeriod}&scope=${selectedScope}&limit=50`;

      if (selectedScope === "country" && selectedCountry) {
        url += `&country=${selectedCountry}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLeaderboardData(data.data.leaderboard);
        setCurrentUser(data.data.currentUser);

        // Update available countries, but keep existing ones if new list is empty
        if (
          data.data.availableCountries &&
          data.data.availableCountries.length > 0
        ) {
          setAvailableCountries(data.data.availableCountries);
        } else if (availableCountries.length === 0) {
          // If no countries in response and we don't have any, set empty array
          setAvailableCountries([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (entry) => {
    switch (selectedMetric) {
      case "xp":
        return `${entry.totalXP?.toLocaleString() || 0} XP`;
      case "focus_time":
        const hours = Math.floor((entry.totalFocusTime || 0) / 60);
        const minutes = (entry.totalFocusTime || 0) % 60;
        return `${hours}h ${minutes}m`;
      case "streak":
        return `${entry.bestStreak || 0} days`;
      case "tasks_completed":
        return `${entry.completedTasks || 0} tasks`;
      default:
        return entry.value || 0;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-200 to-yellow-400 text-white";
      case 2:
        return "bg-gradient-to-br from-gray-100 to-gray-300 text-white";
      case 3:
        return "bg-gradient-to-br from-amber-300 to-amber-500 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const selectedMetricObj = metrics.find((m) => m.id === selectedMetric);
  const selectedPeriodObj = periods.find((p) => p.id === selectedPeriod);
  const selectedScopeObj = scopes.find((s) => s.id === selectedScope);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleSendFriendRequest = async (userId) => {
    if (!session?.user?.token) return;

    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ friend_id: userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send friend request");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSendFriendRequest={handleSendFriendRequest}
        currentUserId={session?.user?.id}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Leaderboard
            </h1>
            {selectedScope !== "global" && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                {selectedScopeObj && (
                  <selectedScopeObj.icon className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span className="text-xs font-medium text-blue-700">
                  {selectedScope === "country" && selectedCountry
                    ? selectedCountry
                    : selectedScopeObj?.label}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {selectedScope === "global" &&
              "Compete with users worldwide and track your progress"}
            {selectedScope === "friends" &&
              "See how you rank among your friends"}
            {selectedScope === "country" &&
              selectedCountry &&
              `Compete with users from ${selectedCountry}`}
            {selectedScope === "country" &&
              !selectedCountry &&
              "Select a country to view rankings"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 flex-wrap">
              {/* Scope Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setScopeDropdownOpen(!scopeDropdownOpen);
                    setMetricDropdownOpen(false);
                    setPeriodDropdownOpen(false);
                    setCountryDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {selectedScopeObj && (
                    <selectedScopeObj.icon className="w-4 h-4" />
                  )}
                  <span>{selectedScopeObj?.label}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {scopeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 overflow-hidden"
                    >
                      {scopes.map((scope) => (
                        <button
                          key={scope.id}
                          onClick={() => {
                            setSelectedScope(scope.id);
                            setScopeDropdownOpen(false);
                            if (scope.id !== "country") {
                              setSelectedCountry("");
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                            selectedScope === scope.id
                              ? "bg-black/10 text-black-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <scope.icon className="w-4 h-4" />
                          <span>{scope.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Country Selector (only show when country scope is selected) */}
              {selectedScope === "country" && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setCountryDropdownOpen(!countryDropdownOpen);
                      setMetricDropdownOpen(false);
                      setPeriodDropdownOpen(false);
                      setScopeDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{selectedCountry || "Select Country"}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {countryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 overflow-hidden max-h-64 overflow-y-auto"
                      >
                        {/* Show available countries from users, or fallback to all countries */}
                        {(availableCountries.length > 0
                          ? availableCountries
                          : countries
                        ).map((country) => (
                          <button
                            key={country}
                            onClick={() => {
                              setSelectedCountry(country);
                              setCountryDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-sm text-left transition-colors ${
                              selectedCountry === country
                                ? "bg-black/10 text-black-700"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {country}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Metric Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setMetricDropdownOpen(!metricDropdownOpen);
                    setPeriodDropdownOpen(false);
                    setScopeDropdownOpen(false);
                    setCountryDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {selectedMetricObj && (
                    <selectedMetricObj.icon className="w-4 h-4" />
                  )}
                  <span>{selectedMetricObj?.label}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {metricDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-56 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 overflow-hidden"
                    >
                      {metrics.map((metric) => (
                        <button
                          key={metric.id}
                          onClick={() => {
                            setSelectedMetric(metric.id);
                            setMetricDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                            selectedMetric === metric.id
                              ? "bg-black/10 text-black-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <metric.icon className="w-4 h-4" />
                          <span>{metric.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Period Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setPeriodDropdownOpen(!periodDropdownOpen);
                    setMetricDropdownOpen(false);
                    setScopeDropdownOpen(false);
                    setCountryDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>{selectedPeriodObj?.label}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {periodDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-40 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 overflow-hidden"
                    >
                      {periods.map((period) => (
                        <button
                          key={period.id}
                          onClick={() => {
                            setSelectedPeriod(period.id);
                            setPeriodDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left transition-colors ${
                            selectedPeriod === period.id
                              ? "bg-black/10 text-black-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {period.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

          <div className="flex-1" />

          {/* Stats Summary */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {leaderboardData.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Current User Card (if not in top 50) */}
      {currentUser && currentUser.rank > 50 && (
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div
            onClick={() => handleUserClick(currentUser)}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getRankBadgeColor(currentUser.rank)}`}
                >
                  #{currentUser.rank}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.name}
                  </p>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    You
                  </span>
                </div>
                <p className="text-xs text-gray-500">@{currentUser.username}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatValue(currentUser)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Level {currentUser.level}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-sm text-gray-500">Loading rankings...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="p-12 text-center">
              {selectedScope === "friends" ? (
                <>
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    No friends on the leaderboard
                  </p>
                  <p className="text-xs text-gray-500">
                    Add friends to compete with them
                  </p>
                </>
              ) : selectedScope === "country" && !selectedCountry ? (
                <>
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Select a country
                  </p>
                  <p className="text-xs text-gray-500">
                    Choose a country from the dropdown above
                  </p>
                </>
              ) : (
                <>
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No data available</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence mode="sync">
                {leaderboardData.map((entry, index) => {
                  const isCurrentUser =
                    entry.userId.toString() === session?.user?.id;

                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.02,
                      }}
                      onClick={() => handleUserClick(entry)}
                      className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-100 transition-colors cursor-pointer ${
                        isCurrentUser ? "bg-blue-50" : ""
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-16">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getRankBadgeColor(entry.rank)}`}
                          >
                            {entry.rank <= 3 ? (
                              getRankIcon(entry.rank)
                            ) : (
                              <span>#{entry.rank}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                          {entry.avatar ? (
                            <img
                              src={entry.avatar}
                              alt={entry.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              {entry.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {entry.name}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded flex-shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">
                            @{entry.username}
                          </p>
                          {entry.country && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <p className="text-xs text-gray-500">
                                {entry.country}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Level Badge */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full">
                          <Award className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs font-medium text-gray-700">
                            Lvl {entry.level}
                          </span>
                        </div>
                      </div>

                      {/* Metric Value */}
                      <div className="flex-shrink-0 text-right w-32">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatValue(entry)}
                        </p>
                        {selectedMetric === "focus_time" &&
                          entry.sessionCount && (
                            <p className="text-xs text-gray-500">
                              {entry.sessionCount} sessions
                            </p>
                          )}
                        {selectedMetric === "streak" &&
                          entry.currentStreak !== undefined && (
                            <p className="text-xs text-gray-500">
                              {entry.currentStreak} current
                            </p>
                          )}
                        {selectedMetric === "xp" && (
                          <p className="text-xs text-gray-500">
                            Level {entry.level}
                          </p>
                        )}
                      </div>

                      {/* Trend Indicator */}
                      {entry.rank <= 10 && (
                        <div className="flex-shrink-0">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
