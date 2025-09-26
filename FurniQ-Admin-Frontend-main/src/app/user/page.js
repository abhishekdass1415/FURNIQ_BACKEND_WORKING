'use client'

import { useEffect, useState } from 'react'

export default function UserPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUser() {
      try {
        // Replace with your backend URL
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user`)
        if (!res.ok) throw new Error('Failed to fetch user data')
        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error('Error fetching user:', err)
        setError('Unable to fetch user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) return <div className="p-6">Loading user data...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!user) return <div className="p-6">No user found</div>

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Admin User Details</h1>
      <div className="space-y-2">
        <p><span className="font-semibold">Name:</span> {user.name}</p>
        <p><span className="font-semibold">Email:</span> {user.email}</p>
      </div>
    </div>
  )
}
