/**
 * Task parsing service for Orbitly application
 * @module lib/services/taskParsingService
 */

// Constants
const DEFAULT_TIME_UNITS = {
  HOUR: "hour",
  MINUTE: "minute",
};

const PRIORITY_LEVELS = {
  URGENT_IMPORTANT: "urgent_important",
  URGENT_NOT_IMPORTANT: "urgent_not_important",
  NOT_URGENT_IMPORTANT: "not_urgent_important",
  NOT_URGENT_NOT_IMPORTANT: "not_urgent_not_important",
};

const COMPLEXITY_FACTORS = {
  DURATION: (minutes) => Math.min(minutes / 60, 3), // Up to 3 points for duration
  PRIORITY: {
    [PRIORITY_LEVELS.URGENT_IMPORTANT]: 3,
    [PRIORITY_LEVELS.URGENT_NOT_IMPORTANT]: 2,
    [PRIORITY_LEVELS.NOT_URGENT_IMPORTANT]: 2,
    [PRIORITY_LEVELS.NOT_URGENT_NOT_IMPORTANT]: 1,
  },
  HAS_DEADLINE: 1,
  HAS_DESCRIPTION: 1,
};

const TIME_OF_DAY = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
};

const ENERGY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

// Category and tag definitions
const CATEGORIES = {
  Work: [
    "work",
    "project",
    "meeting",
    "deadline",
    "presentation",
    "report",
    "email",
    "client",
    "website",
    "coding",
    "development",
  ],
  Health: [
    "exercise",
    "workout",
    "gym",
    "yoga",
    "meditation",
    "doctor",
    "health",
    "fitness",
    "sport",
    "badminton",
    "tennis",
    "running",
  ],
  Personal: [
    "hobby",
    "leisure",
    "read",
    "shopping",
    "family",
    "friend",
    "social",
    "entertainment",
    "relax",
    "break",
  ],
  Study: [
    "study",
    "learn",
    "course",
    "homework",
    "research",
    "assignment",
    "class",
    "practice",
  ],
  Errands: ["errands", "shopping", "groceries", "appointment", "reservation"],
};

const COMMON_TAGS = {
  Work: ["work", "project", "website", "coding", "development"],
  Health: ["health", "fitness", "exercise", "sport", "badminton"],
  Technology: ["computer", "software", "coding", "website", "development"],
  Social: ["social", "friends", "family", "team"],
  Personal: ["personal", "self", "hobby", "leisure"],
};

/**
 * Error class for task parsing errors
 */
class TaskParsingError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "TaskParsingError";
    this.code = code;
  }
}

/**
 * Convert relative time phrase to absolute Date object
 * @param {string} timePhrase - The time phrase to parse (e.g., "in 2 hours", "at 3pm")
 * @param {Date|null} [previousTaskEndTime=null] - Optional reference time
 * @returns {Date} The parsed date
 * @throws {TaskParsingError} If time phrase is invalid
 */
export function parseRelativeTime(timePhrase, previousTaskEndTime = null) {
  if (!timePhrase || typeof timePhrase !== "string") {
    throw new TaskParsingError(
      "Invalid time phrase provided",
      "INVALID_TIME_PHRASE",
    );
  }

  const now = previousTaskEndTime || new Date();
  let result = new Date(now);

  // Handle "next" keyword
  if (timePhrase.toLowerCase().includes("next")) {
    if (previousTaskEndTime) {
      return new Date(previousTaskEndTime);
    }
    throw new TaskParsingError(
      "'next' used without previous task time",
      "MISSING_PREVIOUS_TIME",
    );
  }

  // Handle "after" keyword
  if (timePhrase.toLowerCase().includes("after") && previousTaskEndTime) {
    return new Date(previousTaskEndTime);
  }

  // Handle "in X hours/minutes"
  const inMatch = timePhrase.match(/in (\d+) (hours?|minutes?)/i);
  if (inMatch) {
    const amount = parseInt(inMatch[1]);
    const unit = inMatch[2].toLowerCase();
    if (unit.startsWith(DEFAULT_TIME_UNITS.HOUR)) {
      result.setHours(result.getHours() + amount);
    } else if (unit.startsWith(DEFAULT_TIME_UNITS.MINUTE)) {
      result.setMinutes(result.getMinutes() + amount);
    }
    return result;
  }

  // Handle "at X" (time of day)
  const atMatch = timePhrase.match(/at (\d+)(?::(\d+))?\s*(am|pm)?/i);
  if (atMatch) {
    let hours = parseInt(atMatch[1]);
    const minutes = atMatch[2] ? parseInt(atMatch[2]) : 0;
    const meridiem = atMatch[3]?.toLowerCase();

    // Validate time components
    if (hours < 1 || hours > 12) {
      throw new TaskParsingError(
        "Invalid hour value in time phrase",
        "INVALID_HOUR",
      );
    }
    if (minutes < 0 || minutes > 59) {
      throw new TaskParsingError(
        "Invalid minute value in time phrase",
        "INVALID_MINUTE",
      );
    }

    // Convert to 24-hour format if meridiem is specified
    if (meridiem === "pm" && hours < 12) {
      hours += 12;
    } else if (meridiem === "am" && hours === 12) {
      hours = 0;
    }

    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  // Default to current time if no valid pattern matched
  return result;
}

/**
 * Parse duration phrase into minutes
 * @param {string} durationPhrase - The duration phrase to parse (e.g., "2 hours", "30 minutes")
 * @returns {number|null} Duration in minutes or null if not parseable
 * @throws {TaskParsingError} If duration phrase is invalid
 */
export function parseDuration(durationPhrase) {
  if (!durationPhrase || typeof durationPhrase !== "string") {
    return null;
  }

  const durationMatch = durationPhrase.match(
    /(?:(\d+)\s*(?:hours?|hrs?))?\s*(?:(\d+)\s*(?:minutes?|mins?))?/i,
  );
  if (!durationMatch) {
    return null;
  }

  const hours = durationMatch[1] ? parseInt(durationMatch[1]) : 0;
  const minutes = durationMatch[2] ? parseInt(durationMatch[2]) : 0;

  if (isNaN(hours) && isNaN(minutes)) {
    throw new TaskParsingError("Invalid duration format", "INVALID_DURATION");
  }

  return hours * 60 + minutes;
}

/**
 * Determine task priority based on content and time context
 * @param {Object} task - The task object
 * @param {Object} timeContext - Time context including scheduledTime
 * @returns {string} The determined priority level
 */
export function determineTaskPriority(task, timeContext) {
  if (!task || !timeContext) {
    return PRIORITY_LEVELS.NOT_URGENT_NOT_IMPORTANT;
  }

  const now = new Date();
  const scheduledTime = timeContext.scheduledTime
    ? new Date(timeContext.scheduledTime)
    : null;

  // Consider tasks scheduled within the next 24 hours as urgent
  const isUrgent =
    scheduledTime &&
    scheduledTime.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;

  // Determine importance based on keywords and context
  const importantKeywords = [
    "important",
    "critical",
    "essential",
    "key",
    "crucial",
  ];
  const taskText =
    `${task.title || ""} ${task.description || ""}`.toLowerCase();
  const isImportant = importantKeywords.some((keyword) =>
    taskText.includes(keyword),
  );

  if (isUrgent && isImportant) return PRIORITY_LEVELS.URGENT_IMPORTANT;
  if (isUrgent) return PRIORITY_LEVELS.URGENT_NOT_IMPORTANT;
  if (isImportant) return PRIORITY_LEVELS.NOT_URGENT_IMPORTANT;
  return PRIORITY_LEVELS.NOT_URGENT_NOT_IMPORTANT;
}

/**
 * Determine task category based on content
 * @param {Object} task - The task object
 * @returns {string} The determined category
 */
export function determineTaskCategory(task) {
  if (!task) return "Other";

  const taskText =
    `${task.title || ""} ${task.description || ""}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some((keyword) => taskText.includes(keyword))) {
      return category;
    }
  }

  return "Other";
}

/**
 * Extract tags from task content
 * @param {Object} task - The task object
 * @returns {string[]} Array of tags
 */
export function extractTags(task) {
  if (!task) return [];

  const taskText =
    `${task.title || ""} ${task.description || ""}`.toLowerCase();
  const tags = new Set();

  // Add category as a tag if available
  if (task.category) {
    tags.add(task.category.toLowerCase());
  }

  // Extract common tags
  for (const categoryTags of Object.values(COMMON_TAGS)) {
    categoryTags.forEach((tag) => {
      if (taskText.includes(tag)) {
        tags.add(tag);
      }
    });
  }

  return Array.from(tags);
}

/**
 * Determine task complexity score
 * @param {Object} task - The task object
 * @returns {number} Complexity score (1-10)
 */
export function determineComplexity(task) {
  if (!task) return 5; // Default score

  let score = 5; // Base score

  if (task.estimated_duration) {
    score += COMPLEXITY_FACTORS.DURATION(task.estimated_duration);
  }

  if (task.priority) {
    score += COMPLEXITY_FACTORS.PRIORITY[task.priority] || 1;
  }

  if (task.deadline) score += COMPLEXITY_FACTORS.HAS_DEADLINE;
  if (task.description) score += COMPLEXITY_FACTORS.HAS_DESCRIPTION;

  return Math.min(Math.round(score), 10); // Cap at 10
}

/**
 * Process a sequence of tasks with scheduling and metadata enhancement
 * @param {Object[]} tasks - Array of task objects
 * @returns {Object[]} Array of enhanced task objects
 */
export function processTaskSequence(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TaskParsingError("Tasks must be an array", "INVALID_TASKS_ARRAY");
  }

  let currentTime = new Date();

  return tasks.map((task, index) => {
    // Validate task object
    if (typeof task !== "object" || task === null) {
      console.warn(`Invalid task at index ${index}, using defaults`);
      task = {};
    }

    // Calculate scheduled time based on previous task
    if (index > 0 && tasks[index - 1].estimated_duration) {
      currentTime = new Date(
        currentTime.getTime() + tasks[index - 1].estimated_duration * 60000,
      );
    }

    const timeContext = {
      scheduledTime: currentTime,
      isSequential: index > 0,
    };

    // Process duration from text or existing value
    const durationText = task.duration_text || task.duration;
    const duration = durationText ? parseDuration(durationText) : null;
    const estimatedDuration = duration || task.estimated_duration || 0;

    // Determine energy level based on duration
    let energyRequired = ENERGY_LEVELS.MEDIUM;
    if (estimatedDuration > 120) {
      energyRequired = ENERGY_LEVELS.HIGH;
    } else if (estimatedDuration <= 60) {
      energyRequired = ENERGY_LEVELS.LOW;
    }

    // Determine best time of day
    let bestTimeOfDay = TIME_OF_DAY.AFTERNOON;
    const hours = currentTime.getHours();
    if (hours < 12) {
      bestTimeOfDay = TIME_OF_DAY.MORNING;
    } else if (hours >= 17) {
      bestTimeOfDay = TIME_OF_DAY.EVENING;
    }

    // Enhance task with additional metadata
    return {
      ...validateAndCleanTasks([task])[0],
      estimated_duration: estimatedDuration,
      scheduled_date: currentTime.toISOString(),
      priority: task.priority || determineTaskPriority(task, timeContext),
      category: task.category || determineTaskCategory(task),
      complexity_score: task.complexity_score || determineComplexity(task),
      energy_required: task.energy_required || energyRequired,
      best_time_of_day: task.best_time_of_day || bestTimeOfDay,
      tags: task.tags || extractTags(task),
    };
  });
}

/**
 * Validate and clean task data
 * @param {Object[]} tasks - Array of task objects
 * @returns {Object[]} Array of validated and cleaned task objects
 */
export function validateAndCleanTasks(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TaskParsingError("Tasks must be an array", "INVALID_TASKS_ARRAY");
  }

  return tasks.map((task) => {
    if (typeof task !== "object" || task === null) {
      return getDefaultTask();
    }

    return {
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || PRIORITY_LEVELS.NOT_URGENT_NOT_IMPORTANT,
      estimated_duration: task.estimated_duration || null,
      deadline: task.deadline || null,
      scheduled_date: task.scheduled_date || null,
      scheduled_time: task.scheduled_time || null,
      best_time_of_day: task.best_time_of_day || null,
      energy_required: task.energy_required || ENERGY_LEVELS.MEDIUM,
      complexity_score: task.complexity_score || 5,
      category: task.category || "Other",
      tags: Array.isArray(task.tags) ? task.tags : [],
    };
  });
}

/**
 * Get default task object
 * @returns {Object} Default task object
 */
function getDefaultTask() {
  return {
    title: "",
    description: "",
    priority: PRIORITY_LEVELS.NOT_URGENT_NOT_IMPORTANT,
    estimated_duration: null,
    deadline: null,
    scheduled_date: null,
    scheduled_time: null,
    best_time_of_day: null,
    energy_required: ENERGY_LEVELS.MEDIUM,
    complexity_score: 5,
    category: "Other",
    tags: [],
  };
}
