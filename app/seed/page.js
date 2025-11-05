"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  RefreshCw,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Brain,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [seededUsers, setSeededUsers] = useState([]);
  const [seededSessions, setSeededSessions] = useState([]);

  const handleSeedUsers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/seed/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to seed users");
      }

      setResult(data);
      if (data.users) {
        setSeededUsers(data.users);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSeededUsers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/seed/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get users");
      }

      setSeededUsers(data.users || []);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeededUsers = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all sample users? This cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/seed/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete users");
      }

      setResult(data);
      setSeededUsers([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-black mb-2">
            Database Seeder
          </h1>
          <p className="text-gray-600">
            Create sample users for testing the Friends feature
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSeedUsers}
            disabled={loading}
            className="bg-white border-2 border-green-200 rounded-2xl p-6 hover:border-green-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg text-black mb-2">
              Seed Users
            </h3>
            <p className="text-sm text-gray-600">
              Create 12 sample users with different profiles
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetSeededUsers}
            disabled={loading}
            className="bg-white border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg text-black mb-2">
              View Users
            </h3>
            <p className="text-sm text-gray-600">
              Check existing sample users in database
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeleteSeededUsers}
            disabled={loading}
            className="bg-white border-2 border-red-200 rounded-2xl p-6 hover:border-red-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg text-black mb-2">
              Delete Users
            </h3>
            <p className="text-sm text-gray-600">
              Remove all sample users from database
            </p>
          </motion.button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 mb-6 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Processing...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        {result && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Success</h3>
                <p className="text-sm text-green-700 mb-3">{result.message}</p>

                {result.credentials && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Test Login Credentials:
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span>{" "}
                        {result.credentials.sampleLogin.email}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Password:</span>{" "}
                        {result.credentials.sampleLogin.password}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {result.credentials.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users List */}
        {seededUsers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">
              Sample Users ({seededUsers.length})
            </h2>
            <div className="space-y-3">
              {seededUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {user.profile && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Level</p>
                        <p className="font-semibold text-gray-900">
                          {user.profile.level}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Streak</p>
                        <p className="font-semibold text-gray-900">
                          {user.profile.streak_days}d
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Focus</p>
                        <p className="font-semibold text-gray-900">
                          {Math.round(user.profile.total_focus_hours)}h
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Section */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Focus Sessions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const res = await fetch("/api/seed/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ numSessions: 15 }),
                  });
                  const data = await res.json();
                  if (!res.ok)
                    throw new Error(data.error || "Failed to seed sessions");
                  setSeededSessions(data.sessions || []);
                  setResult({ ...result, sessionMessage: data.message });
                } catch (err) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="bg-white border-2 border-purple-200 rounded-xl p-4 hover:border-purple-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <PlayCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Create Sessions
              </h3>
              <p className="text-sm text-gray-600">
                Add 15 sample focus sessions
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const res = await fetch("/api/seed/sessions", {
                    method: "DELETE",
                  });
                  const data = await res.json();
                  if (!res.ok)
                    throw new Error(data.error || "Failed to delete sessions");
                  setSeededSessions([]);
                  setResult({ ...result, sessionMessage: data.message });
                } catch (err) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="bg-white border-2 border-red-200 rounded-xl p-4 hover:border-red-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Clear Sessions
              </h3>
              <p className="text-sm text-gray-600">
                Remove all sample sessions
              </p>
            </motion.button>
          </div>

          {seededSessions.length > 0 && (
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900">Recent Sessions</h3>
              {seededSessions.slice(0, 5).map((session, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-3 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(session.start_time).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {Math.round(session.duration / 60)}min |
                        Category: {session.category}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      Score: {session.metrics.focus_score}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Users className="w-5 h-5" />
            How to Test Friends Feature
          </h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Click "Seed Users" to create 12 sample users</li>
            <li>Login with any sample user (password: password123 for all)</li>
            <li>Go to Dashboard → Friends</li>
            <li>Search for other users by name or email</li>
            <li>Send friend requests and test the functionality</li>
            <li>
              Open another browser/incognito window to login as different user
            </li>
            <li>Accept/reject requests and test the features</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
