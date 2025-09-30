'use client'

import { useEffect } from 'react'
import ProductSidebar from './components/ProductSidebar'
import { useProducts } from '@/context/ProductContext'

export default function ProductsLayout({ children }) {
  const { products, setProducts } = useProducts()

  // Fetch products from backend when layout mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(data) // update context
      } catch (err) {
        console.error(err)
      }
    }

    fetchProducts()
  }, [setProducts])

  return (
    <div className="flex h-full w-full bg-white rounded-lg shadow-md overflow-hidden">
      <ProductSidebar />
      <div className="flex-grow p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
