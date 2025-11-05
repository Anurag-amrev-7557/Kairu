import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { User } from '@/lib/models';
import { authenticate } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();

    // Authenticate user
    const auth = await authenticate(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // Get user
    const user = await User.findById(auth.userId).select('-password_hash');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        profile: user.profile,
        settings: user.settings,
        subscription: user.subscription,
      },
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
