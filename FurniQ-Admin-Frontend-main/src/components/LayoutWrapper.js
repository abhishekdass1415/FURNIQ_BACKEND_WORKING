'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import Header from './Header' // ensure correct path

const noLayoutRoutes = ['/login', '/register', '/reset-password']

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip auth check for no-layout routes
    if (noLayoutRoutes.includes(pathname)) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(res.data)
      } catch (err) {
        console.error(err)
        localStorage.removeItem('authToken')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [pathname, router])

  // Show loading indicator while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    )
  }

  // For routes without layout, just render children
  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // For all other routes, render Header + main content
  return (
    <>
      {/* Pass user to Header so it can display real info */}
      <Header user={user} />

      <main className="pt-20 p-6 bg-gray-100 min-h-screen">
        {children}
      </main>
    </>
  )
}
