import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Task } from "@/lib/models";
import { authenticate } from "@/lib/auth";

// GET single task
/**
 * Handles GET requests to retrieve a single task for the authenticated user.
 * The task is identified by `taskId` from the URL parameters.
 *
 * @param {Request} req - The incoming Next.js request object.
 * @param {Object} context - The context object containing parameters.
 * @param {Object} context.params - The route parameters.
 * @param {string} context.params.taskId - The ID of the task to retrieve.
 * @returns {Promise<NextResponse>} A JSON response containing the task or an error message.
 *   - On success (200): `{ success: true, task: Task }`
 *   - On authentication failure (401): `{ error: string }`
 *   - On task not found (404): `{ error: string }`
 *   - On internal server error (500): `{ error: string }`
 */
export async function GET(req, { params }) {
  try {
    await connectDB();

    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { taskId } = params;

    const task = await Task.findOne({
      _id: taskId,
      user_id: auth.userId,
    }).populate("parent_goal_id", "title type");

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH update task
/**
 * Handles PATCH requests to update an existing task for the authenticated user.
 * The task is identified by `taskId` from the URL parameters, and updates are provided in the request body.
 *
 * @param {Request} req - The incoming Next.js request object, containing update data in its body.
 * @param {Object} context - The context object containing parameters.
 * @param {Object} context.params - The route parameters.
 * @param {string} context.params.taskId - The ID of the task to update.
 * @returns {Promise<NextResponse>} A JSON response indicating the outcome of the task update.
 *   - On success (200): `{ success: true, message: string, task: Task }`
 *   - On authentication failure (401): `{ error: string }`
 *   - On task not found (404): `{ error: string }`
 *   - On internal server error (500): `{ error: string, details?: string }`
 */
export async function PATCH(req, { params }) {
  try {
    console.log("PATCH /api/tasks/[taskId] - Starting...");
    await connectDB();

    const auth = await authenticate(req);
    console.log("Authentication result:", {
      authenticated: auth.authenticated,
      userId: auth.userId,
    });

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { taskId } = params;
    const updates = await req.json();
    console.log("Updates:", updates); // Removed taskId for brevity.

    // Find and update the task
    const task = await Task.findOneAndUpdate(
      { _id: taskId, user_id: auth.userId },
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("parent_goal_id", "title type");

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    console.log("Task updated successfully:", task);

    return NextResponse.json({
      success: true,
      message: "Task updated",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE task
/**
 * Handles DELETE requests to delete an existing task for the authenticated user.
 * The task is identified by `taskId` from the URL parameters.
 *
 * @param {Request} req - The incoming Next.js request object.
 * @param {Object} context - The context object containing parameters.
 * @param {Object} context.params - The route parameters.
 * @param {string} context.params.taskId - The ID of the task to delete.
 * @returns {Promise<NextResponse>} A JSON response indicating the outcome of the task deletion.
 *   - On success (200): `{ success: true, message: string }`
 *   - On authentication failure (401): `{ error: string }`
 *   - On task not found (404): `{ error: string }`
 *   - On internal server error (500): `{ error: string, details?: string }`
 */
export async function DELETE(req, { params }) {
  try {
    console.log("DELETE /api/tasks/[taskId] - Starting...");
    await connectDB();

    const auth = await authenticate(req);
    console.log("Authentication result:", {
      authenticated: auth.authenticated,
      userId: auth.userId,
    });

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { taskId } = params;
    console.log("Task ID to delete:", taskId);

    const task = await Task.findOneAndDelete({
      _id: taskId,
      user_id: auth.userId,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    console.log("Task deleted successfully:", task._id);

    return NextResponse.json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
