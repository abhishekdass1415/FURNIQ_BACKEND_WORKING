'use client'

import { Bars3Icon, XMarkIcon, HomeIcon, CubeIcon, TagIcon, ClipboardDocumentListIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext' // 1. Import the AuthContext
import Link from 'next/link'

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth(); // 2. Get the real user and logout function from context

  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()

  // This useEffect handles closing the dropdowns when clicking outside of them
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProfile = () => {
    setIsDropdownOpen(false)
    router.push('/profile')
  }

  // 3. The logout handler now calls the central logout function from the context
  const handleLogout = () => {
    setIsDropdownOpen(false)
    logout(); // Use the logout function from AuthContext
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: CubeIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Inventory', href: '/inventory', icon: ClipboardDocumentListIcon },
    { name: 'Users', href: '/users', icon: UsersIcon }, // Corrected link to /users
  ]

  // If user data hasn't loaded yet, show a minimal header to prevent errors
  if (!user) {
    return (
      <header className="fixed top-0 left-0 right-0 z-30 py-3 bg-white shadow-md dark:bg-gray-800">
        <div className="container flex items-center justify-between h-full px-6 mx-auto">
          <div className="text-xl font-bold text-gray-800 dark:text-white">FurniQ Admin</div>
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* --- Mobile Menu --- */}
      <button
        data-menu-button
        className="md:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-md shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative flex flex-col w-64 bg-white dark:bg-gray-800 py-4">
            <div className="py-2 px-6 text-xl font-bold">FurniQ Admin</div>
            <nav className="flex-1 px-2 mt-4">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-2 mt-2 text-sm font-medium rounded-md ${pathname === item.href ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* --- Desktop Header --- */}
      <header className="fixed top-0 left-0 right-0 z-30 py-3 bg-white shadow-md dark:bg-gray-800">
        <div className="container flex items-center justify-between h-full px-6 mx-auto">
          {/* Left Side: Branding */}
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            <Link href="/">FurniQ Admin</Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${pathname.startsWith(item.href) && item.href !== '/' || pathname === item.href
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side: User Dropdown */}
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
                  <p className="text-xs text-gray-500 capitalize dark:text-gray-400">{user.role || 'User'}</p>
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
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-700/20">
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </header>
    </>
  );
}