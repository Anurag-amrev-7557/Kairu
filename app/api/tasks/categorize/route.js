import { NextResponse } from "next/server";

/**
 * Handles POST requests to categorize a task using the Gemini AI API.
 * It takes a task title and an optional description, and returns an AI-generated category, priority, and reasoning.
 * If the Gemini API key is not configured or an error occurs, it falls back to default values.
 *
 * @param {Request} request - The incoming Next.js request object, containing task `title` and `description` in its body.
 * @returns {Promise<NextResponse>} A JSON response containing the categorized task details.
 *   - On success (200): `{ category: string, priority: string, reasoning: string }`
 *   - On missing title (400): `{ error: string }`
 *   - On internal error or Gemini API issue (200 with defaults): `{ category: string, priority: string, reasoning: string }`
 */
export async function POST(request) {
  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured, using default category");
      return NextResponse.json({
        category: "Work",
        priority: "medium",
      });
    }

    // Prepare the prompt for Gemini
    const prompt = `Categorize this task. Return ONLY valid JSON, no markdown.

Title: ${title}
Description: ${description || "None"}

Categories: Work, Personal, Design, Meetings, Other
Priorities: high, medium, low

JSON format: {"category": "...", "priority": "...", "reasoning": "..."}`;

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
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 100,
            responseModalities: ["TEXT"],
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
          systemInstruction: {
            parts: [
              {
                text: "You are a task categorization assistant. Respond with only valid JSON, no thinking process, no explanation outside the JSON.",
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
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      // Fallback to default values
      result = {
        category: "Work",
        priority: "medium",
        reasoning: "Failed to parse AI response",
      };
    }

    // Validate and sanitize the response
    const validCategories = ["Work", "Personal", "Design", "Meetings", "Other"];
    const validPriorities = ["high", "medium", "low"];

    const sanitizedResult = {
      category: validCategories.includes(result.category)
        ? result.category
        : "Work",
      priority: validPriorities.includes(result.priority)
        ? result.priority
        : "medium",
      reasoning: result.reasoning || "Auto-categorized",
    };

    return NextResponse.json(sanitizedResult);
  } catch (error) {
    console.error("Categorization error:", error);
    return NextResponse.json(
      {
        category: "Work",
        priority: "medium",
        reasoning: "Error during categorization, using defaults",
      },
      { status: 200 }, // Still return 200 with defaults
    );
  }
}
