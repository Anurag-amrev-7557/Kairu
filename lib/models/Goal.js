import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  title: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['focus_hours', 'tasks_completed', 'streak', 'skill', 'habit', 'custom'],
    required: true,
  },

  // Target & Progress
  target_metric: {
    value: { type: Number },
    unit: { type: String }, // hours, tasks, days, etc.
  },
  current_progress: { type: Number, default: 0 },
  progress_percentage: { type: Number, default: 0 },

  // Timeline
  start_date: { type: Date, default: Date.now },
  deadline: { type: Date },
  time_frame: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
  },

  // Milestones
  milestones: [{
    title: String,
    target_value: Number,
    completed: { type: Boolean, default: false },
    completed_at: Date,
    reward: String,
  }],

  // Motivation
  motivation_note: { type: String },
  why: { type: String },

  // Rewards
  reward_config: {
    enabled: { type: Boolean, default: false },
    badge_id: String,
    xp_bonus: Number,
    custom_reward: String,
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed', 'cancelled'],
    default: 'active',
  },
  completed_at: { type: Date },

  // Related tasks
  related_tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
}, {
  timestamps: true,
});

// Indexes
goalSchema.index({ user_id: 1, status: 1 });
goalSchema.index({ user_id: 1, deadline: 1 });
goalSchema.index({ type: 1 });

// Virtual for days remaining
goalSchema.virtual('days_remaining').get(function() {
  if (!this.deadline) return null;
  const now = new Date();
  const diff = this.deadline - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to update progress
goalSchema.methods.updateProgress = function(value) {
  this.current_progress = value;
  if (this.target_metric.value) {
    this.progress_percentage = Math.min(100, Math.floor((value / this.target_metric.value) * 100));
  }

  // Check if goal is completed
  if (this.progress_percentage >= 100) {
    this.status = 'completed';
    this.completed_at = new Date();
  }

  // Check milestones
  this.milestones.forEach(milestone => {
    if (!milestone.completed && this.current_progress >= milestone.target_value) {
      milestone.completed = true;
      milestone.completed_at = new Date();
    }
  });
};

// Method to add progress incrementally
goalSchema.methods.addProgress = function(increment) {
  this.updateProgress(this.current_progress + increment);
};

export default mongoose.models.Goal || mongoose.model('Goal', goalSchema);
