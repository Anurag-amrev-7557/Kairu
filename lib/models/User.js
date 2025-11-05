import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password_hash: { type: String },
    name: { type: String },
    username: { type: String, unique: true, sparse: true },
    avatar_url: { type: String },

    settings: {
      timezone: { type: String, default: "UTC" },
      work_hours: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
      },
      notification_prefs: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        break_reminders: { type: Boolean, default: true },
        daily_summary: { type: Boolean, default: true },
      },
      focus_mode: {
        auto_dnd: { type: Boolean, default: false },
        block_websites: [String],
        pomodoro_duration: { type: Number, default: 25 },
        short_break: { type: Number, default: 5 },
        long_break: { type: Number, default: 15 },
      },
      theme: { type: String, default: "light" },
      language: { type: String, default: "en" },
    },

    profile: {
      bio: { type: String, default: "" },
      country: { type: String, default: "" },
      city: { type: String, default: "" },
      chronotype: {
        type: String,
        enum: ["lark", "owl", "neutral"],
        default: "neutral",
      },
      productivity_persona: {
        type: String,
        enum: ["sprinter", "marathon", "batch_processor", "discovering"],
        default: "discovering",
      },
      avg_focus_duration: { type: Number, default: 0 },
      preferred_work_style: {
        type: String,
        enum: ["deep_work", "multitask", "balanced"],
        default: "balanced",
      },
      total_focus_hours: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      xp: { type: Number, default: 0 },
      streak_days: { type: Number, default: 0 },
      best_streak: { type: Number, default: 0 },
      last_active_date: { type: Date },
    },

    subscription: {
      plan: { type: String, enum: ["free", "pro", "team"], default: "free" },
      features: [String],
      started_at: { type: Date },
      expires_at: { type: Date },
    },

    integrations: {
      google_calendar: {
        enabled: { type: Boolean, default: false },
        refresh_token: String,
        last_sync: Date,
      },
      slack: {
        enabled: { type: Boolean, default: false },
        webhook_url: String,
        access_token: String,
      },
      spotify: {
        enabled: { type: Boolean, default: false },
        access_token: String,
        default_playlist: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ "profile.level": 1 });

// Virtual for calculating next level XP requirement
userSchema.virtual("nextLevelXP").get(function () {
  return this.profile.level * 100; // Simple formula: 100 XP per level
});

// Method to add XP and level up
userSchema.methods.addXP = function (xp) {
  this.profile.xp += xp;
  while (this.profile.xp >= this.nextLevelXP) {
    this.profile.xp -= this.nextLevelXP;
    this.profile.level += 1;
  }
};

// Method to update streak
userSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = this.profile.last_active_date
    ? new Date(this.profile.last_active_date)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Continue streak
      this.profile.streak_days += 1;
      if (this.profile.streak_days > this.profile.best_streak) {
        this.profile.best_streak = this.profile.streak_days;
      }
    } else if (diffDays > 1) {
      // Streak broken
      this.profile.streak_days = 1;
    }
    // If diffDays === 0, same day, do nothing
  } else {
    // First activity
    this.profile.streak_days = 1;
    this.profile.best_streak = 1;
  }

  this.profile.last_active_date = today;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
