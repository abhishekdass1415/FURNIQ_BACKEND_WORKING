'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const pathname = usePathname()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: CubeIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Users', href: '/user', icon: UserGroupIcon },
    { name: 'Inventory', href: '/inventory', icon: ArchiveBoxIcon },
 
  ]

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r h-screen">
        <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-gray-900">FurniQ</span>
            <span className="text-indigo-600 font-semibold"> Admin</span>
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}