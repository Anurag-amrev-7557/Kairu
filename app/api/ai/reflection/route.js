import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { authenticate } from "@/lib/auth";
import { Session } from "@/lib/models";
import { generateReflectionPrompts } from "@/lib/ai/gemini";

export async function POST(req) {
  try {
    await connectDB();

    // Authenticate user
    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Fetch the session
    const session = await Session.findOne({
      _id: sessionId,
      user_id: auth.userId,
    }).lean();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Generate reflection prompts
    const result = await generateReflectionPrompts(session);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      questions: result.questions,
    });
  } catch (error) {
    console.error("Generate reflection prompts error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
