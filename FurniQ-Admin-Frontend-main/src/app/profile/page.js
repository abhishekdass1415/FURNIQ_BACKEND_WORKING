'use client'

import { useState, useEffect } from 'react'
import { CameraIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState(null)
  const [tempData, setTempData] = useState(null)

  // Load user data from localStorage or fallback to default
  useEffect(() => {
    const storedUser = localStorage.getItem("userData")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUserData({
        id: parsedUser.id || 'USR-001',
        name: parsedUser.name || 'Guest User',
        email: parsedUser.email || 'guest@furniq.com',
        role: parsedUser.role || 'Visitor'
      })
    } else {
      setUserData({
        id: 'USR-001',
        name: 'Guest User',
        email: 'guest@furniq.com',
        role: 'Visitor'
      })
    }
  }, [])

  const handleEdit = () => {
    setTempData({ ...userData })
    setIsEditing(true)
  }

  const handleSave = () => {
    setUserData({ ...tempData })
    localStorage.setItem("userData", JSON.stringify(tempData)) // persist changes
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleInputChange = (field, value) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!userData) return <p className="p-6">Loading profile...</p>

  return (
    <div className="md:ml-64 pt-16 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Profile</h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                <CheckIcon className="w-5 h-5 mr-2" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border">
                  <CameraIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-4">{userData.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{userData.role}</p>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">User ID:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{userData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{userData.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Personal Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.id}
                        onChange={(e) => handleInputChange('id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-200 font-mono">{userData.id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-200">{userData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={tempData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-200">{userData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <p className="text-gray-900 dark:text-gray-200">{userData.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Additional Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permissions</label>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Read
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Write
                      </span>
                      {userData.role === "admin" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Admin
                        </span>
                      )}
                    </div>
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
