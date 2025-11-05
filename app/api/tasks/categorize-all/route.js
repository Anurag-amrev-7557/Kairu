import { NextResponse } from "next/server";

/**
 * Handles POST requests to categorize a batch of tasks using the Gemini AI API.
 * It takes an array of tasks and returns AI-generated categories and assignments for each task.
 * If the Gemini API key is not configured or an error occurs, it returns an error response.
 *
 * @param {Request} request - The incoming Next.js request object, containing an array of `tasks` in its body.
 * @returns {Promise<NextResponse>} A JSON response containing the generated categories and categorized tasks or an error message.
 *   - On success (200): `{ categories: string[], categorizedTasks: Array<{ id: string, category: string }> }`
 *   - On missing/invalid tasks array (400): `{ error: string }`
 *   - On API key not configured (500): `{ error: string }`
 *   - On internal error or Gemini API issue (500): `{ error: string, details?: string }`
 */
export async function POST(request) {
  try {
    const { tasks } = await request.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Tasks array is required" },
        { status: 400 },
      );
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured, cannot categorize tasks");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    // Prepare the prompt for Gemini to categorize all tasks
    const tasksDescription = tasks
      .map(
        (task, index) =>
          `${index + 1}. Title: "${task.title}", Description: "${task.description || "No description"}"`,
      )
      .join("\n");

    const prompt = `Analyze these tasks and create logical categories for them. Return ONLY valid JSON, no markdown.

Tasks:
${tasksDescription}

Instructions:
- Create 3-7 meaningful category names based on the tasks
- Categories should be concise (1-3 words)
- Assign each task to the most appropriate category
- Return task assignments by their number (1-${tasks.length})

JSON format:
{
  "categories": ["Category1", "Category2", "Category3"],
  "assignments": {
    "1": "Category1",
    "2": "Category2",
    ...
  }
}`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseModalities: ["TEXT"],
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
          systemInstruction: {
            parts: [
              {
                text: "You are a task categorization expert. Analyze tasks and create logical, meaningful categories. Respond with only valid JSON.",
              },
            ],
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Parse the JSON response
    let result;
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Failed to parse AI response");
    }

    // Validate the response structure
    if (!result.categories || !result.assignments) {
      throw new Error("Invalid response structure from AI");
    }

    // Map assignments back to task IDs
    const categorizedTasks = tasks.map((task, index) => {
      const taskNumber = (index + 1).toString();
      const category = result.assignments[taskNumber] || result.categories[0];
      return {
        id: task.id,
        category: category,
      };
    });

    return NextResponse.json({
      categories: result.categories,
      categorizedTasks: categorizedTasks,
    });
  } catch (error) {
    console.error("Bulk categorization error:", error);
    return NextResponse.json(
      {
        error: "Failed to categorize tasks",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
