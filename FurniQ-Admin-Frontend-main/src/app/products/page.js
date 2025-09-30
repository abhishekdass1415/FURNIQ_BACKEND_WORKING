'use client'

import { useState, useEffect } from 'react'
import { useProducts } from '@/context/ProductContext'
import Link from 'next/link'

const categories = [
    { id: 1, name: 'Furniture', subcategories: [{ id: 101, name: 'Sofas' }, { id: 102, name: 'Tables' }, { id: 103, name: 'Bed' }] },
    { id: 2, name: 'Kitchen & Dining', subcategories: [{ id: 201, name: 'Dining Sets' }, { id: 202, name: 'Cookware' }] },
    { id: 3, name: 'Home Decor', subcategories: [{ id: 301, name: 'Lighting' }, { id: 302, name: 'Wall Art' }] },
    { id: 4, name: 'Home Furnishing', subcategories: [{ id: 401, name: 'Cushions' }, { id: 402, name: 'Carpets' }] },
]

export default function ProductsPage() {
  const { products, setProducts, updateProduct } = useProducts()
  const [viewMode, setViewMode] = useState('active')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [loading, setLoading] = useState(true)

  const filteredSubcategories = selectedCategory
    ? categories.find(cat => cat.name === selectedCategory)?.subcategories || []
    : []

  // Fetch products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
        if (!res.ok) throw new Error('Failed to fetch products')
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [setProducts])

  const listSource = products.filter(p => p.status === viewMode)

  const filteredProducts = listSource.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) return false
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false
    return true
  })

  const handleRestore = async (productId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })
      if (!res.ok) throw new Error('Failed to restore product')
      const updatedProduct = await res.json()
      updateProduct(productId, updatedProduct)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-center py-8">Loading products...</p>

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <Link href="/products/add" className="btn-primary">Add New Product</Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Filter Products</h3>
          <button
            onClick={() => { setSelectedCategory(''); setSelectedSubcategory('') }}
            className="text-sm text-indigo-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('') }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="subcategory-select" className="block text-sm font-medium text-gray-700">Subcategory</label>
            <select
              id="subcategory-select"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={!selectedCategory}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">All Subcategories</option>
              {filteredSubcategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex border-b">
        <button 
          onClick={() => setViewMode('active')} 
          className={`py-2 px-4 text-sm font-medium ${viewMode === 'active' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Active ({products.filter(p => p.status === 'active').length})
        </button>
        <button 
          onClick={() => setViewMode('archived')} 
          className={`py-2 px-4 text-sm font-medium ${viewMode === 'archived' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Archived ({products.filter(p => p.status === 'archived').length})
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Product</th>
                <th className="th-style">SKU</th>
                <th className="th-style text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(p => (
                <tr key={p.id} className="align-middle hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <img className="h-12 w-12 rounded-md object-cover" src={p.imageUrl || 'https://via.placeholder.com/48'} alt={p.name} />
                        <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">{p.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {viewMode === 'active' ? (
                      <Link href={`/products/${p.id}`} className="btn-secondary-sm">View</Link>
                    ) : (
                      <button onClick={() => handleRestore(p.id)} className="btn-primary-sm">Restore</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <p className="text-center py-8 text-gray-500">
              No {viewMode} products found.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
