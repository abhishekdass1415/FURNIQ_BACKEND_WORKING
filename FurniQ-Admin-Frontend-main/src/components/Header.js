'use client'

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'

// Note: `useRouter`, `usePathname`, and `Link` are removed as direct navigation
// can be handled with standard `<a>` tags and window.location for simplicity
// in a way that is guaranteed to work in all environments.

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // User state now starts as null and is fetched from the API.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Use window.location to get the current path for active link styling.
  const [pathname, setPathname] = useState('');

  // --- API and User Data Handling ---
  useEffect(() => {
    // Set the current path for navigation styling
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }

    const fetchUserProfile = async () => {
      // 1. Get the auth token stored during login.
      const token = localStorage.getItem('authToken');

      // 2. If no token exists, the user is not logged in. Redirect them.
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        // 3. Use the token to fetch the user's profile from the secure API endpoint.
        const res = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          // If the token is invalid or expired, clear it and redirect to login.
          localStorage.removeItem('authToken');
          throw new Error('Session expired. Please log in again.');
        }

        const userData = await res.json();
        setUser(userData);

      } catch (error) {
        console.error("Profile fetch error:", error);
        // If anything goes wrong, ensure the user is sent to the login page.
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);


  // --- Event Handlers ---
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

  const handleLogout = () => {
    setIsDropdownOpen(false)
    // Clear the token that proves the user is logged in.
    localStorage.removeItem('authToken')
    // Redirect to the login page.
    window.location.href = '/login';
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Products', href: '/products', icon: '🛋️' },
    { name: 'Categories', href: '/categories', icon: '📂' },
    { name: 'Inventory', href: '/inventory', icon: '📦' },
    { name: 'Users', href: '/users', icon: '👥' },
  ]

  // While fetching user data, show a minimal loading state to prevent errors.
  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-30 py-3 bg-white shadow-md">
        <div className="container flex items-center justify-between h-full px-6 mx-auto">
          <div className="text-xl font-bold text-gray-800">FurniQ Admin</div>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </header>
    );
  }

  // If the user data could not be fetched for any reason, this prevents the page from crashing.
  if (!user) {
    return null; // The useEffect will handle redirection.
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
        <div ref={mobileMenuRef} className="fixed inset-0 z-40 md:hidden bg-gray-800 bg-opacity-75">
          <div className="fixed inset-y-0 left-0 w-64 bg-white p-4">
            <h2 className="text-lg font-bold text-indigo-600 mb-4">FurniQ Admin</h2>
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${pathname === item.href
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* --- Desktop Header --- */}
      <header className="fixed top-0 left-0 right-0 z-30 py-3 bg-white shadow-md">
        <div className="container flex items-center justify-between h-full px-6 mx-auto">
          {/* Left Side: Branding */}
          <div className="text-xl font-bold text-gray-800">
            <a href="/">FurniQ Admin</a>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${pathname === item.href
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600'
                  }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Side: User Dropdown */}
          <ul className="flex items-center flex-shrink-0 space-x-6">
            <li className="relative" ref={dropdownRef}>
              <button
                className="align-middle rounded-full flex items-center p-1 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="ml-2 hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <a href="/profile" onClick={() => setIsDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile & Settings
                  </a>
                  <div className="border-t"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
