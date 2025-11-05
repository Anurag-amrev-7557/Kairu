import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  title: { type: String, required: true },
  description: { type: String },

  // Classification
  category: { type: String },
  tags: [String],
  priority: {
    type: String,
    enum: ['urgent_important', 'urgent_not_important', 'not_urgent_important', 'not_urgent_not_important'],
    default: 'not_urgent_not_important',
  },

  // Time estimates
  estimated_duration: { type: Number }, // in minutes
  actual_duration: { type: Number },
  time_spent: { type: Number, default: 0 },

  // Complexity & Energy
  complexity_score: { type: Number, min: 1, max: 10 },
  energy_required: { type: String, enum: ['low', 'medium', 'high'] },
  best_time_of_day: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'] },

  // Deadlines & Schedule
  scheduled_date: { type: Date },
  scheduled_time: { type: String },
  deadline: { type: Date },
  completed_at: { type: Date },

  // Status
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in_progress', 'blocked', 'completed', 'cancelled'],
    default: 'todo',
  },
  outcome: { type: String, enum: ['success', 'partial', 'failed'] },

  // Relationships
  subtasks: [{
    title: String,
    completed: { type: Boolean, default: false },
    completed_at: Date,
  }],
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  parent_goal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  linked_sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],

  // Recurrence
  recurrence_rule: {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: { type: Number },
    days_of_week: [Number], // 0-6 (Sun-Sat)
    end_date: { type: Date },
  },

  // Integration
  external_id: { type: String },
  external_source: { type: String },
  sync_enabled: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Indexes
taskSchema.index({ user_id: 1, status: 1 });
taskSchema.index({ user_id: 1, scheduled_date: 1 });
taskSchema.index({ user_id: 1, deadline: 1 });
taskSchema.index({ user_id: 1, priority: 1 });
taskSchema.index({ parent_goal_id: 1 });

// Virtual for completion percentage of subtasks
taskSchema.virtual('completion_percentage').get(function() {
  if (!this.subtasks || this.subtasks.length === 0) return 0;
  const completed = this.subtasks.filter(st => st.completed).length;
  return Math.floor((completed / this.subtasks.length) * 100);
});

// Virtual for overdue status
taskSchema.virtual('is_overdue').get(function() {
  if (!this.deadline) return false;
  return this.status !== 'completed' && new Date() > this.deadline;
});

// Method to complete task
taskSchema.methods.completeTask = function(outcome = 'success') {
  this.status = 'completed';
  this.completed_at = new Date();
  this.outcome = outcome;
};

// Method to calculate actual duration from linked sessions
taskSchema.methods.calculateActualDuration = async function() {
  if (this.linked_sessions && this.linked_sessions.length > 0) {
    const Session = mongoose.model('Session');
    const sessions = await Session.find({ _id: { $in: this.linked_sessions } });
    this.actual_duration = sessions.reduce((total, session) => total + (session.duration || 0), 0) / 60; // Convert to minutes
    this.time_spent = this.actual_duration;
  }
};

export default mongoose.models.Task || mongoose.model('Task', taskSchema);
