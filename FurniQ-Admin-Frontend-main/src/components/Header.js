'use client'

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch logged-in user from backend
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(res.data)
      } catch (error) {
        console.error(error)
        localStorage.removeItem('authToken')
        router.push('/login')
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUser()
  }, [router])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('[data-menu-button]')) {
        setIsMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProfile = () => {
    setIsDropdownOpen(false)
    router.push('/profile')
  }

  const handleLogout = () => {
    setIsDropdownOpen(false)
    localStorage.removeItem('authToken')
    router.push('/login')
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Products', href: '/products', icon: '🛋️' },
    { name: 'Categories', href: '/categories', icon: '📂' },
    { name: 'Inventory', href: '/inventory', icon: '📦' },
    { name: 'User', href: '/user', icon: '👥' },
  ]

  if (loadingUser) return <div className="text-center py-4">Loading header...</div>

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        data-menu-button
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-md shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" ref={mobileMenuRef}>
          {/* Add your mobile menu content here */}
        </div>
      )}

      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-30 py-3 bg-white shadow-md dark:bg-gray-800">
        <div className="container flex items-center justify-between h-full px-6 mx-auto">
          {/* Branding */}
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            <Link href="/">FurniQ Admin</Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Dropdown */}
          <ul className="flex items-center flex-shrink-0 space-x-6">
            <li className="relative" ref={dropdownRef}>
              <button
                className="align-middle rounded-full flex items-center p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="ml-2 hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[120px] dark:text-gray-300">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{user.role}</p>
                </div>
                <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                  <div className="px-4 py-2 border-b dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <button onClick={handleProfile} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                    Profile & Settings
                  </button>
                  <div className="border-t dark:border-gray-600"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </header>
    </>
  )
}
