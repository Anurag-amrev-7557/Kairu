"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Calendar,
  Zap,
  Shield,
  Camera,
  Mail,
  Clock,
  Moon,
  Sun,
  Monitor,
  Check,
  X,
  Loader2,
  ChevronRight,
  Save,
  AlertCircle,
} from "lucide-react";

const TABS = {
  PROFILE: "profile",
  PREFERENCES: "preferences",
  NOTIFICATIONS: "notifications",
  SECURITY: "security",
  ACCOUNT: "account",
};

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState(TABS.PROFILE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    avatar_url: "",
  });

  // Preferences form state
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC",
    work_hours_start: "09:00",
    work_hours_end: "17:00",
  });

  // Notifications form state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    break_reminders: true,
    daily_summary: true,
  });

  // Focus mode settings
  const [focusMode, setFocusMode] = useState({
    auto_dnd: false,
    pomodoro_duration: 25,
    short_break: 5,
    long_break: 15,
  });

  // Load user data
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        username: session.user.username || "",
        email: session.user.email || "",
        avatar_url: session.user.avatar_url || "",
      });
      setAvatarPreview(session.user.avatar_url || null);
    }
  }, [session]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Update session
      await update({
        ...session,
        user: {
          ...session.user,
          name: profileData.name,
        },
      });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: "success", text: "Preferences saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({
        type: "success",
        text: "Notification settings saved!",
      });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save notifications" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-black mb-1">Settings</h1>
          <p className="text-gray-500 text-xs">
            Manage your account settings and preferences
          </p>
        </div>
</parameter>
</parameter>
</parameter>

        {/* Message Banner */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-3 p-3 rounded-lg border flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <p
                className={`text-xs font-medium ${
                  message.type === "success" ? "text-green-900" : "text-red-900"
                }`}
              >
                {message.text}
              </p>
              <button onClick={() => setMessage(null)} className="ml-auto">
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Layout */}
        <div className="flex gap-4 flex-1 min-h-0">
</parameter>
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: TABS.PROFILE, label: "Profile", icon: User },
                { id: TABS.PREFERENCES, label: "Preferences", icon: Palette },
                {
                  id: TABS.NOTIFICATIONS,
                  label: "Notifications",
                  icon: Bell,
                },
                { id: TABS.SECURITY, label: "Security", icon: Lock },
                { id: TABS.ACCOUNT, label: "Account", icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMessage(null);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-xs">{tab.label}</span>
</parameter>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Profile Tab */}
                {activeTab === TABS.PROFILE && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                  >
                    <h2 className="text-lg font-bold text-black mb-4">
                      Profile Settings
                    </h2>

                    {/* Avatar Section */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
</parameter>
                        Profile Photo
                      </label>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              profileData.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-0 right-0 w-6 h-6 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
                          >
                            <Camera className="w-3 h-3 text-white" />
</parameter>
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-0.5">
                            JPG, PNG or GIF. Max 2MB
                          </p>
                          <button className="text-xs text-gray-500 hover:text-gray-700 underline">
</parameter>
                            Remove photo
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Name Field */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Username Field */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            username: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        placeholder="Enter your username"
                      />
                      <p className="text-xs text-gray-500 mt-1">
</parameter>
                        Your unique username for the platform
                      </p>
                    </div>

                    {/* Email Field */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
</parameter>
                        Email cannot be changed
                      </p>
                    </div>

                    {/* Bio Field */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-1">
                        Bio
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
</parameter>
                        Brief description for your profile
                      </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
</parameter>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === TABS.PREFERENCES && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-lg font-bold text-black mb-4">
                      Preferences
                    </h2>

                    {/* Theme */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
</parameter>
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: "light", label: "Light", icon: Sun },
                          { value: "dark", label: "Dark", icon: Moon },
                          { value: "system", label: "System", icon: Monitor },
                        ].map((theme) => {
                          const Icon = theme.icon;
                          return (
                            <button
                              key={theme.value}
                              onClick={() =>
                                setPreferences({
                                  ...preferences,
                                  theme: theme.value,
                                })
                              }
                              className={`p-3 rounded-lg border-2 transition-all ${
                                preferences.theme === theme.value
                                  ? "border-black bg-gray-100"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <Icon className="w-5 h-5 mx-auto mb-1" />
                              <p className="text-xs font-medium">
</parameter>
                                {theme.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Language */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-1">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            language: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-1">
                        Timezone
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            timezone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">
                          Eastern Time (US & Canada)
                        </option>
                        <option value="America/Chicago">
                          Central Time (US & Canada)
                        </option>
                        <option value="America/Denver">
                          Mountain Time (US & Canada)
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time (US & Canada)
                        </option>
                      </select>
                    </div>

                    {/* Work Hours */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Work Hours
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={preferences.work_hours_start}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                work_hours_start: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={preferences.work_hours_end}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                work_hours_end: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Focus Mode Settings */}
                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
</parameter>
                        Focus Mode Settings
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-xs text-gray-900">
                              Auto Do Not Disturb
                            </p>
                            <p className="text-xs text-gray-500">
</parameter>
                              Automatically enable DND during focus sessions
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setFocusMode({
                                ...focusMode,
                                auto_dnd: !focusMode.auto_dnd,
                              })
                            }
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              focusMode.auto_dnd ? "bg-black" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
</parameter>
                                focusMode.auto_dnd
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-2">
                              Pomodoro (min)
                            </label>
                            <input
                              type="number"
                              value={focusMode.pomodoro_duration}
                              onChange={(e) =>
                                setFocusMode({
                                  ...focusMode,
                                  pomodoro_duration: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-2">
                              Short Break (min)
                            </label>
                            <input
                              type="number"
                              value={focusMode.short_break}
                              onChange={(e) =>
                                setFocusMode({
                                  ...focusMode,
                                  short_break: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-2">
                              Long Break (min)
                            </label>
                            <input
                              type="number"
                              value={focusMode.long_break}
                              onChange={(e) =>
                                setFocusMode({
                                  ...focusMode,
                                  long_break: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === TABS.NOTIFICATIONS && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-lg font-bold text-black mb-4">
                      Notifications
                    </h2>

                    <div className="space-y-3 mb-4">
</parameter>
                      {[
                        {
                          key: "email",
                          label: "Email Notifications",
                          description:
                            "Receive email updates about your activity",
                        },
                        {
                          key: "push",
                          label: "Push Notifications",
                          description: "Get push notifications on this device",
                        },
                        {
                          key: "break_reminders",
                          label: "Break Reminders",
                          description:
                            "Get reminded to take breaks during focus sessions",
                        },
                        {
                          key: "daily_summary",
                          label: "Daily Summary",
                          description:
                            "Receive a summary of your daily progress",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div>
                            <p className="font-medium text-xs text-gray-900">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
</parameter>
                              {item.description}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setNotifications({
                                ...notifications,
                                [item.key]: !notifications[item.key],
                              })
                            }
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              notifications[item.key]
                                ? "bg-black"
                                : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
</parameter>
                                notifications[item.key]
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNotifications}
                        disabled={saving}
                        className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === TABS.SECURITY && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-lg font-bold text-black mb-4">
                      Security
                    </h2>

                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h3 className="font-bold text-sm text-black mb-1">
</parameter>
                          Change Password
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Update your password to keep your account secure
                        </p>
                        <button className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium">
                          Change Password
                        </button>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h3 className="font-bold text-sm text-black mb-1">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Add an extra layer of security to your account
                        </p>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                          Enable 2FA
                        </button>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h3 className="font-bold text-sm text-black mb-1">
                          Active Sessions
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Manage devices where you're currently logged in
                        </p>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                          View Sessions
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Account Tab */}
                {activeTab === TABS.ACCOUNT && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-lg font-bold text-black mb-4">
                      Account Management
                    </h2>

                    <div className="space-y-3">
                      <div className="p-4 bg-white rounded-lg border border-gray-200">
                        <h3 className="font-bold text-sm text-black mb-1">
                          Export Data
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          Download all your data in JSON format
                        </p>
                        <button className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium">
                          Export Data
                        </button>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="font-bold text-sm text-red-900 mb-1">
                          Delete Account
                        </h3>
                        <p className="text-xs text-red-700 mb-3">
                          Permanently delete your account and all data. This
                          action cannot be undone.
                        </p>
                        <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
