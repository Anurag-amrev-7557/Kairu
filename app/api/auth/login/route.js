import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { User } from '@/lib/models';
import { verifyPassword, generateToken } from '@/lib/auth';
import { cache } from '@/lib/db/redis';

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update streak
    user.updateStreak();
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Cache user session in Redis
    await cache.set(
      `session:${user._id}`,
      {
        userId: user._id,
        email: user.email,
        lastLogin: new Date(),
      },
      86400 // 24 hours
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        profile: user.profile,
        settings: user.settings,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
