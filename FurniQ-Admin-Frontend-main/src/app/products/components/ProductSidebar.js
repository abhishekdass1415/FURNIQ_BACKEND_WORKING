'use client'

import { useEffect } from 'react'
import { useProducts } from '@/context/ProductContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ProductSidebar() {
  const { products, setProducts } = useProducts()
  const pathname = usePathname()

  // ✅ Fetch products from backend when sidebar loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products') // relative path → works in dev & prod
        if (res.ok) {
          const data = await res.json()
          setProducts(data) // update global context
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      }
    }

    // Only fetch if products are empty to avoid duplicate requests
    if (!products || products.length === 0) {
      fetchProducts()
    }
  }, [products, setProducts])

  // ✅ Filter for only active products
  const activeProducts = products.filter(product => product.status === 'active')

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">All Products</h3>
      <nav>
        <ul className="space-y-2">
          {activeProducts.map(product => {
            const href = `/products/${product.id}`
            const isActive = pathname === href

            return (
              <li key={product.id}>
                <Link
                  href={href}
                  className={`flex flex-col items-center text-center p-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {/* Product Image */}
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/80'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md flex-shrink-0 shadow-sm"
                  />
                  {/* Product Name */}
                  <span className="mt-2 text-sm">{product.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
