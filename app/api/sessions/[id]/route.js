import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Session, User } from '@/lib/models';
import { authenticate } from '@/lib/auth';
import { cache } from '@/lib/db/redis';

// GET single session
export async function GET(req, { params }) {
  try {
    await connectDB();

    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const session = await Session.findOne({
      _id: params.id,
      user_id: auth.userId,
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, session });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update session (end, pause, add interruption, etc.)
export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const session = await Session.findOne({
      _id: params.id,
      user_id: auth.userId,
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const data = await req.json();

    // Handle different update actions
    if (data.action === 'end') {
      session.endSession();

      // Add reflection and outcome
      if (data.post_reflection) session.post_reflection = data.post_reflection;
      if (data.outcome) session.outcome = data.outcome;
      if (data.mood_end) session.metrics.mood_end = data.mood_end;
      if (data.energy_end) session.metrics.energy_end = data.energy_end;

      await session.save();

      // Award XP to user
      const user = await User.findById(auth.userId);
      const xpGain = Math.floor(session.duration / 60); // 1 XP per minute
      user.addXP(xpGain);
      user.profile.total_focus_hours += session.duration / 3600;
      await user.save();

      // Clear active session cache
      await cache.del(`session:active:${auth.userId}`);
      await cache.del(`recent:sessions:${auth.userId}`);

      return NextResponse.json({
        success: true,
        message: 'Session ended',
        session,
        xp_gained: xpGain,
        new_level: user.profile.level,
      });
    }

    if (data.action === 'pause') {
      session.pause_history.push({
        paused_at: new Date(),
      });
      await session.save();
      return NextResponse.json({ success: true, message: 'Session paused', session });
    }

    if (data.action === 'resume') {
      const lastPause = session.pause_history[session.pause_history.length - 1];
      if (lastPause && !lastPause.resumed_at) {
        lastPause.resumed_at = new Date();
        lastPause.duration = Math.floor((lastPause.resumed_at - lastPause.paused_at) / 1000);
      }
      await session.save();
      return NextResponse.json({ success: true, message: 'Session resumed', session });
    }

    if (data.action === 'add_interruption') {
      session.interruptions.push({
        timestamp: new Date(),
        source: data.source,
        type: data.type || 'external',
        duration: data.duration,
        notes: data.notes,
      });
      session.metrics.context_switches += 1;
      await session.save();
      return NextResponse.json({ success: true, message: 'Interruption recorded', session });
    }

    // General update
    Object.keys(data).forEach(key => {
      if (key !== 'action' && session[key] !== undefined) {
        session[key] = data[key];
      }
    });

    await session.save();
    return NextResponse.json({ success: true, message: 'Session updated', session });

  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE session
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const session = await Session.findOneAndDelete({
      _id: params.id,
      user_id: auth.userId,
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Clear caches
    await cache.del(`session:active:${auth.userId}`);
    await cache.del(`recent:sessions:${auth.userId}`);

    return NextResponse.json({ success: true, message: 'Session deleted' });

  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
