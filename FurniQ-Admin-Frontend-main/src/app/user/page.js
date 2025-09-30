'use client'

import { useEffect, useState } from 'react'
import { UserPlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Fetch users from backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
        if (!res.ok) throw new Error('Failed to fetch users')
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filtered users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="text-center p-6">Loading users...</div>

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <Link href="/users/add" className="btn-primary flex items-center">
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add User
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">All Users ({filteredUsers.length})</h3>
            <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-xs border-gray-300 rounded-md shadow-sm text-sm"
            />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Name</th>
                <th className="th-style">Role</th>
                <th className="th-style">Status</th>
                <th className="th-style">Date Joined</th>
                <th className="th-style">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                           {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                    </div>
                  </td>
                  <td className="td-style">{user.role}</td>
                  <td className="td-style">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="td-style text-gray-500">{new Date(user.joined).toLocaleDateString()}</td>
                  <td className="td-style">
                    <Link href={`/users/edit/${user.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      Edit
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">No users match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
