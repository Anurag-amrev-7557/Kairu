import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import connectDB from "@/lib/db/mongodb";
import { Session } from "@/lib/models";

// Helper function to generate a random date within the last 30 days
function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(
    8 + Math.floor(Math.random() * 12), // Between 8 AM and 8 PM
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60),
    0,
  );
  return date;
}

// Helper function to generate random metrics
function generateRandomMetrics() {
  const focusScore = 60 + Math.floor(Math.random() * 40); // 60-100
  const flowStateChance = Math.random();

  return {
    focus_score: focusScore,
    flow_state_detected: flowStateChance > 0.6, // 40% chance of flow state
    flow_state_duration:
      flowStateChance > 0.6 ? Math.floor(Math.random() * 1800) : 0,
    mood_start: Math.floor(Math.random() * 10) + 1,
    mood_end: Math.floor(Math.random() * 10) + 1,
    energy_start: Math.floor(Math.random() * 10) + 1,
    energy_end: Math.floor(Math.random() * 10) + 1,
    context_switches: Math.floor(Math.random() * 5),
    ambient_noise_level: ["quiet", "moderate", "loud"][
      Math.floor(Math.random() * 3)
    ],
    location: ["home", "office", "cafe", "other"][
      Math.floor(Math.random() * 4)
    ],
  };
}

// Sample categories and their weights
const categories = [
  { name: "deep_work", weight: 0.3 },
  { name: "learning", weight: 0.2 },
  { name: "creative", weight: 0.2 },
  { name: "admin", weight: 0.15 },
  { name: "other", weight: 0.15 },
];

// Helper function to get a weighted random category
function getRandomCategory() {
  const rand = Math.random();
  let sum = 0;
  for (const category of categories) {
    sum += category.weight;
    if (rand < sum) return category.name;
  }
  return categories[0].name;
}

// Generate sample interruptions
function generateInterruptions() {
  const interruptions = [];
  const numInterruptions = Math.floor(Math.random() * 4); // 0-3 interruptions

  for (let i = 0; i < numInterruptions; i++) {
    interruptions.push({
      type: ["self", "external", "system"][Math.floor(Math.random() * 3)],
      timestamp: new Date(),
      duration: Math.floor(Math.random() * 300), // 0-300 seconds
      source: Math.random() > 0.5 ? "notification" : "distraction",
      notes: Math.random() > 0.5 ? "Phone notification" : "Mental wandering",
    });
  }

  return interruptions;
}

export async function POST(req) {
  try {
    await connectDB();

    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse request body for number of sessions to create
    const { numSessions = 10 } = await req.json();

    // Delete existing sessions for this user
    await Session.deleteMany({ user_id: session.user.id });

    // Create sample sessions
    const sampleSessions = [];
    for (let i = 0; i < numSessions; i++) {
      const startTime = getRandomDate(30);
      const duration = (25 + Math.floor(Math.random() * 6) * 5) * 60; // 25-50 minutes in seconds
      const endTime = new Date(startTime.getTime() + duration * 1000);

      sampleSessions.push({
        user_id: session.user.id,
        title: `Focus Session ${i + 1}`,
        description: Math.random() > 0.7 ? "Sample session description" : "",
        start_time: startTime,
        end_time: endTime,
        duration: duration,
        planned_duration: duration,
        category: getRandomCategory(),
        is_active: false,
        metrics: generateRandomMetrics(),
        interruptions: generateInterruptions(),
        outcome: ["success", "partial", "failed", "cancelled"][
          Math.floor(Math.random() * 4)
        ],
        visibility: "private",
      });
    }

    // Insert the sample sessions
    await Session.insertMany(sampleSessions);

    return NextResponse.json({
      success: true,
      message: `Created ${numSessions} sample focus sessions`,
      sessions: sampleSessions.map((s) => ({
        start_time: s.start_time,
        duration: s.duration,
        category: s.category,
        metrics: s.metrics,
      })),
    });
  } catch (error) {
    console.error("Error seeding sessions:", error);
    return NextResponse.json(
      { error: "Failed to seed sessions", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Delete all sessions for this user
    const result = await Session.deleteMany({ user_id: session.user.id });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} sessions`,
    });
  } catch (error) {
    console.error("Error deleting sessions:", error);
    return NextResponse.json(
      { error: "Failed to delete sessions", details: error.message },
      { status: 500 },
    );
  }
}
