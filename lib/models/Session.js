import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      index: true,
    },

    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: [
        "deep_work",
        "meeting",
        "learning",
        "creative",
        "admin",
        "break",
        "other",
      ],
      default: "other",
    },
    tags: [String],

    // Time tracking
    start_time: { type: Date, required: true },
    end_time: { type: Date },
    duration: { type: Number }, // in seconds
    planned_duration: { type: Number }, // in seconds
    is_active: { type: Boolean, default: false },

    // Intention & Reflection
    pre_intention: { type: String },
    post_reflection: { type: String },
    outcome: {
      type: String,
      enum: ["success", "partial", "failed", "cancelled"],
    },

    // Interruptions
    interruptions: [
      {
        timestamp: { type: Date },
        source: { type: String },
        type: { type: String, enum: ["self", "external", "system"] },
        duration: { type: Number },
        notes: { type: String },
      },
    ],

    pause_history: [
      {
        paused_at: { type: Date },
        resumed_at: { type: Date },
        duration: { type: Number },
      },
    ],

    // Metrics
    metrics: {
      mood_start: { type: Number, min: 1, max: 10 },
      mood_end: { type: Number, min: 1, max: 10 },
      energy_start: { type: Number, min: 1, max: 10 },
      energy_end: { type: Number, min: 1, max: 10 },
      focus_score: { type: Number, min: 0, max: 100 },
      flow_state_detected: { type: Boolean, default: false },
      flow_state_duration: { type: Number },
      context_switches: { type: Number, default: 0 },
      ambient_noise_level: {
        type: String,
        enum: ["quiet", "moderate", "loud"],
      },
      location: { type: String, enum: ["home", "office", "cafe", "other"] },
    },

    // Environment
    environment: {
      weather: { type: String },
      temperature: { type: Number },
      music_played: { type: Boolean },
      playlist_name: { type: String },
      apps_used: [String],
      browser_tabs: { type: Number },
    },

    // Voice notes and attachments (for later)
    voice_notes: [
      {
        url: String,
        duration: Number,
        timestamp: Date,
      },
    ],
    screenshots: [
      {
        url: String,
        timestamp: Date,
        caption: String,
      },
    ],

    // Social features
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "FocusRoom" },
    visibility: {
      type: String,
      enum: ["private", "friends", "public"],
      default: "private",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
sessionSchema.index({ user_id: 1, start_time: -1 });
sessionSchema.index({ user_id: 1, is_active: 1 });
sessionSchema.index({ user_id: 1, category: 1 });
sessionSchema.index({ start_time: 1 });
sessionSchema.index({ "metrics.flow_state_detected": 1 });

// Virtual for calculated duration if session is active
sessionSchema.virtual("current_duration").get(function () {
  if (this.is_active && this.start_time) {
    return Math.floor((Date.now() - this.start_time.getTime()) / 1000);
  }
  return this.duration || 0;
});

// Method to calculate focus score
sessionSchema.methods.calculateFocusScore = function () {
  let score = 100;

  // Deduct for interruptions (5 points each)
  score -= (this.interruptions?.length || 0) * 5;

  // Deduct for context switches (3 points each)
  score -= (this.metrics?.context_switches || 0) * 3;

  // Bonus for flow state
  if (this.metrics?.flow_state_detected) {
    score += 20;
  }

  // Ensure score is between 0-100
  this.metrics.focus_score = Math.max(0, Math.min(100, score));
  return this.metrics.focus_score;
};

// Method to detect flow state (>25 min uninterrupted)
sessionSchema.methods.detectFlowState = function () {
  if (!this.is_active && this.duration) {
    const hasMinimalInterruptions = (this.interruptions?.length || 0) <= 1;
    const isLongEnough = this.duration >= 1500; // 25 minutes

    if (hasMinimalInterruptions && isLongEnough) {
      this.metrics.flow_state_detected = true;
      this.metrics.flow_state_duration = this.duration;
    }
  }
};

// Method to end session
sessionSchema.methods.endSession = function () {
  if (this.is_active) {
    this.end_time = new Date();
    this.duration = Math.floor((this.end_time - this.start_time) / 1000);
    this.is_active = false;

    // Calculate metrics
    this.detectFlowState();
    this.calculateFocusScore();
  }
};

export default mongoose.models.Session ||
  mongoose.model("Session", sessionSchema);
