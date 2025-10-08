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
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import the AuthContext
import { CameraIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  const { user, loading, updateProfile } = useAuth(); // Get user and functions from context
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false)
  const [tempData, setTempData] = useState(null)

  // Redirect to login if user is not authenticated after loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleEdit = () => {
    setTempData({ ...user }); // Set temp data for editing form
    setIsEditing(true);
  }

  const handleSave = async () => {
    if (!tempData) return;

    // Call the updateProfile function from the context
    await updateProfile({
      name: tempData.name,
      email: tempData.email
    });

    setIsEditing(false);
  }

  const handleCancel = () => {
    setIsEditing(false);
  }

  const handleInputChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // Show a loading state while the context is checking for a logged-in user
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">User Profile</h2>
          {!isEditing ? (
            <button onClick={handleEdit} className="btn-primary flex items-center">
              <PencilIcon className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button onClick={handleSave} className="btn-primary flex items-center">
                <CheckIcon className="w-4 h-4 mr-2" /> Save Changes
              </button>
              <button onClick={handleCancel} className="btn-secondary flex items-center">
                <XMarkIcon className="w-4 h-4 mr-2" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border">
                    <CameraIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mt-4">{user.name}</h3>
                <p className="text-gray-600">{user.role || 'User'}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">{user.name}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={tempData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900 text-lg">{user.email}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-900 text-lg">{user.role || 'User'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

