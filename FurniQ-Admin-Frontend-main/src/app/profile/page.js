import { NextResponse } from 'next/server';
import prisma from '../../config/prismaConfig';
import { verify } from 'jsonwebtoken';

// --- GET The Logged-In User's Profile ---
export async function GET(request) {
  try {
    // 1. Get token from the request headers
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication token not provided.' }, { status: 401 });
    }

    // 2. Verify the token
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    // 3. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      // Exclude the password hash from the response for security
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: 'Failed to fetch user profile.' }, { status: 500 });
  }
}


// --- UPDATE The Logged-In User's Profile ---
export async function PUT(request) {
  try {
    // 1. Verify token to identify the user (same as GET)
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication token not provided.' }, { status: 401 });
    }
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { name, email } = await request.json();

    // 2. Validate input
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // 3. Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
      // Select the data to return, excluding the password
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Profile PUT Error:", error);
    // Handle potential unique constraint violation for email
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This email is already in use by another account.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
  }
}
