import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import { hashPassword } from "@/lib/auth";

const sampleUsers = [
  {
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
    password: "password123",
    profile: {
      level: 15,
      xp: 450,
      total_focus_hours: 127,
      streak_days: 12,
      best_streak: 18,
      chronotype: "lark",
      productivity_persona: "sprinter",
      preferred_work_style: "deep_work",
    },
  },
  {
    name: "Michael Chen",
    email: "michael.chen@example.com",
    password: "password123",
    profile: {
      level: 22,
      xp: 780,
      total_focus_hours: 245,
      streak_days: 25,
      best_streak: 31,
      chronotype: "neutral",
      productivity_persona: "marathon",
      preferred_work_style: "balanced",
    },
  },
  {
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    password: "password123",
    profile: {
      level: 8,
      xp: 220,
      total_focus_hours: 56,
      streak_days: 5,
      best_streak: 9,
      chronotype: "owl",
      productivity_persona: "batch_processor",
      preferred_work_style: "multitask",
    },
  },
  {
    name: "David Rodriguez",
    email: "david.rodriguez@example.com",
    password: "password123",
    profile: {
      level: 18,
      xp: 590,
      total_focus_hours: 178,
      streak_days: 8,
      best_streak: 22,
      chronotype: "lark",
      productivity_persona: "sprinter",
      preferred_work_style: "deep_work",
    },
  },
  {
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    password: "password123",
    profile: {
      level: 12,
      xp: 340,
      total_focus_hours: 98,
      streak_days: 15,
      best_streak: 15,
      chronotype: "neutral",
      productivity_persona: "discovering",
      preferred_work_style: "balanced",
    },
  },
  {
    name: "James Taylor",
    email: "james.taylor@example.com",
    password: "password123",
    profile: {
      level: 25,
      xp: 920,
      total_focus_hours: 312,
      streak_days: 42,
      best_streak: 42,
      chronotype: "lark",
      productivity_persona: "marathon",
      preferred_work_style: "deep_work",
    },
  },
  {
    name: "Jennifer Martinez",
    email: "jennifer.martinez@example.com",
    password: "password123",
    profile: {
      level: 10,
      xp: 280,
      total_focus_hours: 72,
      streak_days: 3,
      best_streak: 11,
      chronotype: "owl",
      productivity_persona: "batch_processor",
      preferred_work_style: "multitask",
    },
  },
  {
    name: "Robert Brown",
    email: "robert.brown@example.com",
    password: "password123",
    profile: {
      level: 20,
      xp: 650,
      total_focus_hours: 205,
      streak_days: 18,
      best_streak: 28,
      chronotype: "neutral",
      productivity_persona: "sprinter",
      preferred_work_style: "balanced",
    },
  },
  {
    name: "Jessica Garcia",
    email: "jessica.garcia@example.com",
    password: "password123",
    profile: {
      level: 14,
      xp: 410,
      total_focus_hours: 134,
      streak_days: 7,
      best_streak: 16,
      chronotype: "lark",
      productivity_persona: "marathon",
      preferred_work_style: "deep_work",
    },
  },
  {
    name: "Daniel Lee",
    email: "daniel.lee@example.com",
    password: "password123",
    profile: {
      level: 16,
      xp: 490,
      total_focus_hours: 156,
      streak_days: 21,
      best_streak: 25,
      chronotype: "owl",
      productivity_persona: "discovering",
      preferred_work_style: "multitask",
    },
  },
  {
    name: "Amanda White",
    email: "amanda.white@example.com",
    password: "password123",
    profile: {
      level: 9,
      xp: 230,
      total_focus_hours: 64,
      streak_days: 4,
      best_streak: 8,
      chronotype: "neutral",
      productivity_persona: "batch_processor",
      preferred_work_style: "balanced",
    },
  },
  {
    name: "Christopher Harris",
    email: "christopher.harris@example.com",
    password: "password123",
    profile: {
      level: 19,
      xp: 620,
      total_focus_hours: 189,
      streak_days: 14,
      best_streak: 20,
      chronotype: "lark",
      productivity_persona: "sprinter",
      preferred_work_style: "deep_work",
    },
  },
];

export async function POST(request) {
  try {
    // Optional: Add a secret key check to prevent unauthorized seeding
    const { secret } = await request.json().catch(() => ({}));

    if (process.env.NODE_ENV === "production" && secret !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized - seeding not allowed in production without secret" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Check if users already exist
    const existingCount = await User.countDocuments({
      email: { $in: sampleUsers.map((u) => u.email) },
    });

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `${existingCount} sample users already exist. Skipping seed.`,
        existingCount,
      });
    }

    // Hash passwords and prepare users
    const usersToInsert = await Promise.all(
      sampleUsers.map(async (user) => {
        const password_hash = await hashPassword(user.password);
        return {
          name: user.name,
          email: user.email,
          password_hash,
          profile: {
            ...user.profile,
            last_active_date: new Date(),
          },
          settings: {
            timezone: "UTC",
            work_hours: {
              start: "09:00",
              end: "17:00",
            },
            notification_prefs: {
              email: true,
              push: true,
              break_reminders: true,
              daily_summary: true,
            },
            focus_mode: {
              auto_dnd: false,
              block_websites: [],
              pomodoro_duration: 25,
              short_break: 5,
              long_break: 15,
            },
            theme: "light",
            language: "en",
          },
          subscription: {
            plan: "free",
            features: [],
          },
        };
      })
    );

    // Insert all users
    const insertedUsers = await User.insertMany(usersToInsert);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedUsers.length} sample users`,
      count: insertedUsers.length,
      users: insertedUsers.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        profile: u.profile,
      })),
      credentials: {
        note: "All sample users have the password: password123",
        sampleLogin: {
          email: "emma.johnson@example.com",
          password: "password123",
        },
      },
    });
  } catch (error) {
    console.error("Seed users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed users" },
      { status: 500 }
    );
  }
}

// GET - Check seeded users
export async function GET(request) {
  try {
    await dbConnect();

    const seededUsers = await User.find({
      email: { $in: sampleUsers.map((u) => u.email) },
    })
      .select("name email profile.level profile.streak_days profile.total_focus_hours")
      .lean();

    return NextResponse.json({
      success: true,
      count: seededUsers.length,
      users: seededUsers,
      note: "These are the sample users created for testing",
    });
  } catch (error) {
    console.error("Get seeded users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get seeded users" },
      { status: 500 }
    );
  }
}

// DELETE - Remove all seeded users (for testing cleanup)
export async function DELETE(request) {
  try {
    const { secret } = await request.json().catch(() => ({}));

    if (process.env.NODE_ENV === "production" && secret !== process.env.SEED_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized - deletion not allowed in production without secret" },
        { status: 403 }
      );
    }

    await dbConnect();

    const result = await User.deleteMany({
      email: { $in: sampleUsers.map((u) => u.email) },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} sample users`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete seeded users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete seeded users" },
      { status: 500 }
    );
  }
}
