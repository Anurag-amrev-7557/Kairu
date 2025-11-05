/**
 * Gemini AI service for Orbitly application
 * @module lib/ai/gemini
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Constants
const DEFAULT_MODEL = "gemini-2.5-flash";
const RESPONSE_CLEANING_REGEX = {
  JSON_CODE_BLOCK: /```json\n?/g,
  GENERAL_CODE_BLOCK: /```\n?/g,
};

/**
 * Error class for Gemini AI service errors
 */
class GeminiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
  }
}

// Initialize Gemini AI with error handling
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiError(
      "Gemini API key is not configured",
      "MISSING_API_KEY",
    );
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error("Failed to initialize Gemini AI:", error);
  throw error;
}

/**
 * Get the Gemini model instance
 * @param {string} [modelName=DEFAULT_MODEL] - Model name to use
 * @returns {Object} Generative model instance
 * @throws {GeminiError} If model initialization fails
 */
export function getGeminiModel(modelName = DEFAULT_MODEL) {
  try {
    return genAI.getGenerativeModel({ model: modelName });
  } catch (error) {
    throw new GeminiError("Failed to initialize model", "MODEL_INIT_FAILED");
  }
}

/**
 * Clean API response text by removing markdown code blocks
 * @param {string} text - Response text to clean
 * @returns {string} Cleaned text
 */
function cleanResponse(text) {
  if (!text) return "";

  let cleanedText = text.trim();

  // Remove JSON code block markers
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText
      .replace(RESPONSE_CLEANING_REGEX.JSON_CODE_BLOCK, "")
      .replace(RESPONSE_CLEANING_REGEX.GENERAL_CODE_BLOCK, "");
  }
  // Remove general code block markers
  else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(
      RESPONSE_CLEANING_REGEX.GENERAL_CODE_BLOCK,
      "",
    );
  }

  return cleanedText;
}

/**
 * Generate a structured API response
 * @param {boolean} success - Whether the operation succeeded
 * @param {any} data - Response data
 * @param {string} [error] - Error message
 * @param {string} [details] - Error details
 * @returns {Object} Structured API response
 */
function createResponse(success, data, error = null, details = null) {
  const response = { success };
  if (success) {
    response.data = data;
  } else {
    response.error = error;
    if (details) response.details = details;
  }
  return response;
}

/**
 * Parse natural language task input using Gemini AI
 * @param {string} input - Natural language input to parse
 * @param {string} [modelName=DEFAULT_MODEL] - Model name to use
 * @returns {Promise<Object>} Parsed tasks with success status
 */
export async function parseTaskFromNaturalLanguage(
  input,
  modelName = DEFAULT_MODEL,
) {
  if (!input || typeof input !== "string") {
    return createResponse(
      false,
      null,
      "Invalid input provided",
      "Input must be a non-empty string",
    );
  }

  const model = getGeminiModel(modelName);

  const prompt = `You are a task parsing assistant that can identify multiple tasks in a single input. Parse the following natural language input into structured task format(s).

For each task identified in the input, extract:
- title: Task title (clear and specific)
- description: Additional context and details
- duration_text: Original duration text from input
- estimated_duration: Duration in minutes
- deadline: ISO date string if deadline mentioned
- scheduled_date: ISO date string if specific date mentioned
- scheduled_time: Time in HH:MM format if mentioned
- priority: One of ["urgent_important", "urgent_not_important", "not_urgent_important", "not_urgent_not_important"]
- category: Best matching category (Work, Health, Personal, Study, etc.)
- tags: Array of relevant tags (max 3-5)
- complexity_score: 1-10 based on task complexity
- energy_required: One of ["low", "medium", "high"]
- best_time_of_day: One of ["morning", "afternoon", "evening", "night"]

Important:
- Create separate tasks for distinct activities
- If tasks are sequential (e.g., "then", "after that"), list them in order
- Include original duration text for each task
- Consider task relationships when setting scheduled times

Input: "${input}"

Respond with ONLY a valid JSON object containing an array of tasks. If information is not provided, omit that field or use reasonable defaults.

Example format:
{
  "tasks": [
    {
      "title": "Work on website development",
      "description": "Frontend development work",
      "duration_text": "1 hour",
      "estimated_duration": 60,
      "category": "Work",
      "tags": ["development", "frontend", "website"],
      "complexity_score": 7,
      "energy_required": "high",
      "best_time_of_day": "morning"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the response
    const cleanedText = cleanResponse(text);
    const parsedData = JSON.parse(cleanedText);

    // Normalize response format
    if (!parsedData.tasks || !Array.isArray(parsedData.tasks)) {
      parsedData.tasks = Array.isArray(parsedData) ? parsedData : [parsedData];
    }

    return createResponse(true, parsedData.tasks);
  } catch (error) {
    console.error("Error parsing task:", error);
    return createResponse(
      false,
      null,
      "Failed to parse task input",
      error.message,
    );
  }
}

/**
 * Generate focus insights from session data
 * @param {Object} sessionsData - Array of session data
 * @param {Object} tasksData - Array of task data
 * @param {Object} habitsData - Array of habit data
 * @param {Object} goalsData - Array of goal data
 * @param {Object} userData - User data
 * @param {string} [modelName=DEFAULT_MODEL] - Model name to use
 * @returns {Promise<Object>} Generated insights with success status
 */
export async function generateFocusInsights(
  sessionsData,
  tasksData,
  habitsData,
  goalsData,
  userData,
  modelName = DEFAULT_MODEL,
) {
  if (!sessionsData || !Array.isArray(sessionsData)) {
    return createResponse(
      false,
      null,
      "Invalid sessions data",
      "Sessions data must be an array",
    );
  }

  const model = getGeminiModel(modelName);

  // Prepare summary data for analysis
  const summary = {
    totalSessions: sessionsData.length,
    totalFocusTime: sessionsData.reduce((acc, s) => acc + (s.duration || 0), 0),
    categories: {},
    averageFocusScore: 0,
    flowStates: 0,
    totalInterruptions: 0,
    moodTrends: [],
    energyTrends: [],
    timeOfDayData: {},
    completedTasks:
      tasksData?.filter((t) => t.status === "completed")?.length || 0,
    totalTasks: tasksData?.length || 0,
    habits: {
      total: habitsData?.length || 0,
      active: habitsData?.filter((h) => h.status === "active")?.length || 0,
      streaks: habitsData?.map((h) => h.current_streak || 0) || [],
    },
    goals: {
      total: goalsData?.length || 0,
      inProgress:
        goalsData?.filter((g) => g.status === "in_progress")?.length || 0,
      completed:
        goalsData?.filter((g) => g.status === "completed")?.length || 0,
      categories:
        goalsData?.reduce((acc, g) => {
          acc[g.category] = (acc[g.category] || 0) + 1;
          return acc;
        }, {}) || {},
    },
    user: {
      level: userData?.profile?.level || 1,
      totalFocusHours: userData?.profile?.total_focus_hours || 0,
      streakDays: userData?.profile?.streak_days || 0,
      friendsCount: userData?.friends_count || 0,
    },
  };

  // Aggregate session data
  sessionsData.forEach((session) => {
    // Categories
    const cat = session.category || "other";
    if (!summary.categories[cat]) {
      summary.categories[cat] = { count: 0, totalTime: 0 };
    }
    summary.categories[cat].count++;
    summary.categories[cat].totalTime += session.duration || 0;

    // Metrics
    if (session.metrics?.focus_score) {
      summary.averageFocusScore += session.metrics.focus_score;
    }
    if (session.metrics?.flow_state_detected) {
      summary.flowStates++;
    }
    if (session.interruptions) {
      summary.totalInterruptions += session.interruptions.length;
    }
    if (session.metrics?.mood_start) {
      summary.moodTrends.push(session.metrics.mood_start);
    }
    if (session.metrics?.energy_start) {
      summary.energyTrends.push(session.metrics.energy_start);
    }

    // Time of day analysis
    const hour = new Date(session.start_time).getHours();
    let timeOfDay;
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else timeOfDay = "night";

    if (!summary.timeOfDayData[timeOfDay]) {
      summary.timeOfDayData[timeOfDay] = {
        count: 0,
        totalTime: 0,
        focusScores: [],
      };
    }
    summary.timeOfDayData[timeOfDay].count++;
    summary.timeOfDayData[timeOfDay].totalTime += session.duration || 0;
    if (session.metrics?.focus_score) {
      summary.timeOfDayData[timeOfDay].focusScores.push(
        session.metrics.focus_score,
      );
    }
  });

  if (sessionsData.length > 0) {
    summary.averageFocusScore = Math.round(
      summary.averageFocusScore / sessionsData.length,
    );
  }

  const prompt = `You are a productivity insights analyst. Analyze the following user data and generate 3-5 actionable, personalized insights.

Data Summary:
${JSON.stringify(summary, null, 2)}

Generate insights that are:
1. Specific and data-driven
2. Actionable (user can do something about it)
3. Encouraging and positive (even when pointing out areas for improvement)
4. Varied (cover different aspects: timing, focus, habits, goals, patterns)
5. Holistic (consider relationships between different metrics)
6. Personalized (based on user level and progress)

Consider analyzing:
- Focus patterns and optimal times
- Task completion rates and efficiency
- Habit formation and streak maintenance
- Goal progress and achievement rate
- Social engagement impact
- Level progression and milestones
- Flow state frequency and conditions

Respond with a JSON array of insight objects, each with:
- type: One of ["success", "warning", "info", "tip"]
- title: Short, catchy title (max 50 chars)
- description: Detailed insight (max 150 chars)
- metric: Optional relevant metric to display
- suggestion: Optional actionable suggestion

Example format:
[
  {
    "type": "success",
    "title": "Morning Power User",
    "description": "You're 40% more productive during morning sessions. Your focus score averages 85 before noon!",
    "metric": "85 avg focus score",
    "suggestion": "Schedule your most important deep work between 8-11 AM"
  }
]

Return ONLY the JSON array, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the response
    const cleanedText = cleanResponse(text);
    const insights = JSON.parse(cleanedText);

    return createResponse(
      true,
      Array.isArray(insights) ? insights : [insights],
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return createResponse(
      false,
      null,
      "Failed to generate insights",
      error.message,
    );
  }
}

/**
 * Generate personalized session reflection prompts
 * @param {Object} sessionData - Session data
 * @param {string} [modelName=DEFAULT_MODEL] - Model name to use
 * @returns {Promise<Object>} Generated questions with success status
 */
export async function generateReflectionPrompts(
  sessionData,
  modelName = DEFAULT_MODEL,
) {
  if (!sessionData || typeof sessionData !== "object") {
    return createResponse(
      false,
      null,
      "Invalid session data",
      "Session data must be an object",
    );
  }

  const model = getGeminiModel(modelName);

  const prompt = `You are a thoughtful productivity coach. Based on the following completed focus session, generate 2-3 reflection questions to help the user learn and improve.

Session Data:
- Duration: ${sessionData.duration || "N/A"} seconds
- Category: ${sessionData.category || "N/A"}
- Focus Score: ${sessionData.metrics?.focus_score || "N/A"}
- Flow State: ${sessionData.metrics?.flow_state_detected ? "Yes" : "No"}
- Interruptions: ${sessionData.interruptions?.length || 0}
- Mood Change: ${sessionData.metrics?.mood_start || "N/A"} → ${sessionData.metrics?.mood_end || "N/A"}
- Energy Change: ${sessionData.metrics?.energy_start || "N/A"} → ${sessionData.metrics?.energy_end || "N/A"}

Generate questions that are:
1. Specific to this session's characteristics
2. Encourage self-reflection and learning
3. Help identify patterns and improvements
4. Are brief and clear

Respond with a JSON array of question strings.

Example: ["What helped you achieve flow today?", "How could you reduce interruptions next time?"]

Return ONLY the JSON array, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse the response
    const cleanedText = cleanResponse(text);
    const questions = JSON.parse(cleanedText);

    return createResponse(
      true,
      Array.isArray(questions) ? questions : [questions],
    );
  } catch (error) {
    console.error("Error generating reflection prompts:", error);
    return createResponse(
      false,
      null,
      "Failed to generate reflection prompts",
      error.message,
    );
  }
}

export default {
  parseTaskFromNaturalLanguage,
  generateFocusInsights,
  generateReflectionPrompts,
  getGeminiModel,
};
