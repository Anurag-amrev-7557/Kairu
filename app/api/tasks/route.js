import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Task } from "@/lib/models";
import { authenticate } from "@/lib/auth";

// GET all tasks
/**
 * Handles GET requests to retrieve tasks for the authenticated user.
 * Allows filtering tasks by status, priority, and scheduled date.
 *
 * @param {Request} req - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A JSON response containing the tasks or an error message.
 *   - On success (200): `{ success: true, tasks: Task[] }`
 *   - On authentication failure (401): `{ error: string }`
 *   - On internal server error (500): `{ error: string }`
 */
export async function GET(req) {
  try {
    await connectDB();

    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const date = searchParams.get("date");

    // Build query
    const query = { user_id: auth.userId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (date) {
      const targetDate = new Date(date);
      query.scheduled_date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    }

    const tasks = await Task.find(query)
      .sort({ deadline: 1, priority: 1 })
      .populate("parent_goal_id", "title type");

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create task
/**
 * Handles POST requests to create a new task for the authenticated user.
 * It validates the incoming data, sanitizes it, and creates a new task in the database.
 *
 * @param {Request} req - The incoming Next.js request object, containing the task data in its body.
 * @returns {Promise<NextResponse>} A JSON response indicating the outcome of the task creation.
 *   - On success (201): `{ success: true, message: string, task: Task }`
 *   - On authentication failure (401): `{ error: string }`
 *   - On invalid input (400): `{ error: string, details?: string }`
 *   - On duplicate task (409): `{ error: string, details?: string }`
 *   - On internal server error (500): `{ error: string, details?: string }`
 */
export async function POST(req) {
  // This is the outer try block
  try {
    console.log("POST /api/tasks - Starting...");
    await connectDB();

    const auth = await authenticate(req);
    console.log("Authentication result:", {
      authenticated: auth.authenticated,
      userId: auth.userId,
    });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const data = await req.json();
    console.log("Request data:", data);

    // Validate required fields
    if (!data.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate and sanitize task data
    const taskToCreate = {
      user_id: auth.userId,
      title: data.title.trim(),
      description: data.description?.trim() || "",
      status: data.status || "todo",
      priority: data.priority || "not_urgent_not_important",
      estimated_duration: Number(data.estimated_duration) || 0,
      category: data.category?.trim() || "Work",
      tags: Array.isArray(data.tags) ? data.tags : [],
      scheduled_date: data.scheduled_date
        ? new Date(data.scheduled_date)
        : null,
      scheduled_time: data.scheduled_time?.trim() || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
    };
    console.log("Creating task with sanitized data:", taskToCreate);

    // This inner try...catch is for handling specific database errors
    try {
      const task = await Task.create(taskToCreate);
      console.log("Task created successfully:", task);

      return NextResponse.json(
        {
          success: true,
          message: "Task created",
          task,
        },
        { status: 201 },
      );
    } catch (error) {
      console.error("Create task error:", error);

      // Handle mongoose validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message,
        );
        return NextResponse.json(
          {
            error: "Validation error",
            details: validationErrors.join(", "),
          },
          { status: 400 },
        );
      }

      // Handle other specific database errors
      if (error.code === 11000) {
        return NextResponse.json(
          {
            error: "Duplicate task error",
            details: "A task with these details already exists",
          },
          { status: 409 },
        );
      }

      // Fallback for other creation errors
      return NextResponse.json(
        {
          error: "Internal server error during task creation",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // THIS CATCH BLOCK WAS MISSING
  } catch (error) {
    console.error("General error in POST /api/tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
