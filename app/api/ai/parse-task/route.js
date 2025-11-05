import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { parseTaskFromNaturalLanguage } from "@/lib/ai/gemini";
import {
  processTaskSequence,
  validateAndCleanTasks,
} from "@/lib/services/taskParsingService";

export async function POST(req) {
  try {
    // Authenticate user
    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { input } = await req.json();

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 },
      );
    }

    // Parse the natural language input into multiple tasks
    const result = await parseTaskFromNaturalLanguage(input);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 500 },
      );
    }

    // Process and validate tasks
    const processedTasks = processTaskSequence(result.data);
    const validatedTasks = validateAndCleanTasks(processedTasks);

    return NextResponse.json({
      success: true,
      tasks: validatedTasks,
    });
  } catch (error) {
    console.error("Parse task error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
