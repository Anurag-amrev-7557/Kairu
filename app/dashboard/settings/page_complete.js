"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
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
  Download,
  Trash2,
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    avatar_url: "",
    bio: "",
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

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Delete confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Load user data
  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      const token = session?.accessToken;

      if (!token) {
        console.error("No access token found");
        return;
      }

      const profileRes = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        const user = profileJson.user;

        setProfileData({
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          avatar_url: user.avatar_url || "",
          bio: user.profile?.bio || "",
        });
        setAvatarPreview(user.avatar_url || session?.user?.image || null);

        if (user.settings) {
          setPreferences({
            theme: user.settings.theme || "light",
            language: user.settings.language || "en",
            timezone: user.settings.timezone || "UTC",
            work_hours_start: user.settings.work_hours?.start || "09:00",
            work_hours_end: user.settings.work_hours?.end || "17:00",
          });

          if (user.settings.notification_prefs) {
            setNotifications({
              email: user.settings.notification_prefs.email !== false,
              push: user.settings.notification_prefs.push !== false,
              break_reminders:
                user.settings.notification_prefs.break_reminders !== false,
              daily_summary:
                user.settings.notification_prefs.daily_summary !== false,
            });
          }

          if (user.settings.focus_mode) {
            setFocusMode({
              auto_dnd: user.settings.focus_mode.auto_dnd || false,
              pomodoro_duration:
                user.settings.focus_mode.pomodoro_duration || 25,
              short_break: user.settings.focus_mode.short_break || 5,
              long_break: user.settings.focus_mode.long_break || 15,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setMessage({ type: "error", text: "Failed to load user data" });
    } finally {
      setLoading(false);
    }
  };
