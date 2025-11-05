import mongoose from "mongoose";

const habitCompletionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    default: "",
  },
});

const habitSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "target",
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
    },
    target_days: {
      type: [Number], // 0 = Sunday, 1 = Monday, etc. for weekly/custom
      default: [0, 1, 2, 3, 4, 5, 6], // All days for daily
    },
    target_count: {
      type: Number,
      default: 1, // Times per day/week
    },
    current_streak: {
      type: Number,
      default: 0,
    },
    longest_streak: {
      type: Number,
      default: 0,
    },
    total_completions: {
      type: Number,
      default: 0,
    },
    completion_history: [habitCompletionSchema],
    is_archived: {
      type: Boolean,
      default: false,
    },
    reminder_enabled: {
      type: Boolean,
      default: false,
    },
    reminder_time: {
      type: String, // Format: "HH:MM"
      default: "09:00",
    },
    category: {
      type: String,
      enum: [
        "health",
        "productivity",
        "learning",
        "fitness",
        "mindfulness",
        "social",
        "finance",
        "other",
      ],
      default: "other",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
habitSchema.index({ user_id: 1, createdAt: -1 });
habitSchema.index({ user_id: 1, is_archived: 1 });
habitSchema.index({ "completion_history.date": 1 });

// Method to check if habit is completed for a specific date
habitSchema.methods.isCompletedOnDate = function (date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const completion = this.completion_history.find((c) => {
    const completionDate = new Date(c.date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === targetDate.getTime();
  });

  return completion ? completion.completed : false;
};

// Method to mark habit as complete for a date
habitSchema.methods.markComplete = function (date = new Date(), notes = "") {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Check if already completed on this date
  const existingIndex = this.completion_history.findIndex((c) => {
    const completionDate = new Date(c.date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === targetDate.getTime();
  });

  if (existingIndex >= 0) {
    // Update existing completion
    this.completion_history[existingIndex].completed = true;
    this.completion_history[existingIndex].notes = notes;
  } else {
    // Add new completion
    this.completion_history.push({
      date: targetDate,
      completed: true,
      notes: notes,
    });
  }

  this.total_completions += 1;
  this.calculateStreak();
};

// Method to mark habit as incomplete for a date
habitSchema.methods.markIncomplete = function (date = new Date()) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const existingIndex = this.completion_history.findIndex((c) => {
    const completionDate = new Date(c.date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === targetDate.getTime();
  });

  if (existingIndex >= 0) {
    this.completion_history[existingIndex].completed = false;
    if (this.total_completions > 0) {
      this.total_completions -= 1;
    }
  }

  this.calculateStreak();
};

// Method to calculate current streak
habitSchema.methods.calculateStreak = function () {
  if (this.completion_history.length === 0) {
    this.current_streak = 0;
    return;
  }

  // Sort completions by date descending
  const sortedCompletions = this.completion_history
    .filter((c) => c.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedCompletions.length === 0) {
    this.current_streak = 0;
    return;
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastCompletion = new Date(sortedCompletions[0].date);
  lastCompletion.setHours(0, 0, 0, 0);

  // Check if streak is still active (last completion was today or yesterday)
  const daysSinceLastCompletion = Math.floor(
    (today - lastCompletion) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceLastCompletion > 1) {
    // Streak broken
    this.current_streak = 0;
    return;
  }

  // Count consecutive days
  let currentDate = new Date(lastCompletion);
  for (let i = 0; i < sortedCompletions.length; i++) {
    const completionDate = new Date(sortedCompletions[i].date);
    completionDate.setHours(0, 0, 0, 0);

    if (completionDate.getTime() === currentDate.getTime()) {
      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Check if we should skip based on frequency
      const expectedDate = new Date(currentDate);
      if (completionDate.getTime() !== expectedDate.getTime()) {
        break;
      }
    }
  }

  this.current_streak = streak;

  // Update longest streak if needed
  if (this.current_streak > this.longest_streak) {
    this.longest_streak = this.current_streak;
  }
};

// Method to get completion rate
habitSchema.methods.getCompletionRate = function (days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const completions = this.completion_history.filter((c) => {
    const completionDate = new Date(c.date);
    return c.completed && completionDate >= startDate;
  });

  const completionRate = (completions.length / days) * 100;
  return Math.round(completionRate);
};

// Method to check if habit should be done today
habitSchema.methods.isDueToday = function () {
  const today = new Date().getDay();

  if (this.frequency === "daily") {
    return true;
  }

  if (this.frequency === "weekly" || this.frequency === "custom") {
    return this.target_days.includes(today);
  }

  return true;
};

export default mongoose.models.Habit || mongoose.model("Habit", habitSchema);
