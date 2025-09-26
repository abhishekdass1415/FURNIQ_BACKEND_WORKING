'use client'

import { useState, useEffect } from 'react'
import { useProducts } from '@/context/ProductContext' // use context
import Link from 'next/link'


// Categories will be fetched from backend API
export default function Products() {
  const { products, loading, error, deleteProduct, getStockStatus, refreshProducts } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [categories, setCategories] = useState([])
  const [allCategories, setAllCategories] = useState([]) // Store all categories including subcategories

  // Fetch categories from backend API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
        if (response.ok) {
          const data = await response.json()
          setAllCategories(data)
          
          // Filter main categories (those without parentId) for the main dropdown
          const mainCategories = data.filter(category => !category.parentId)
          setCategories(mainCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const filteredSubcategories = selectedCategory
    ? allCategories.filter(cat => {
        const selectedCat = categories.find(c => c.name === selectedCategory)
        return selectedCat && cat.parentId === selectedCat.id
      })
    : []

  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) return false
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false
    return true
  })

  // ✅ helper for INR formatting
  const formatPrice = (price) => {
    if (!price) return "₹0"
    const numeric = parseInt(price.toString().replace(/\D/g, "")) || 0
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(numeric)
  }

  return (
    <div className="md:ml-64 pt-16">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Product Management</h2>
          <div className="flex gap-2">
            <button
              onClick={refreshProducts}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
            <Link href="/products/add" className="btn-primary">Add New Product</Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Filter Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('') }} className="w-full border rounded px-3 py-2">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Subcategory</label>
              <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)} disabled={!selectedCategory} className="w-full border rounded px-3 py-2">
                <option value="">All Subcategories</option>
                {filteredSubcategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => { setSelectedCategory(''); setSelectedSubcategory('') }} className="btn-secondary">Clear Filters</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium">All Products ({filteredProducts.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs">Image</th>
                  <th className="px-6 py-3 text-left text-xs">Name</th>
                  <th className="px-6 py-3 text-left text-xs">SKU</th>
                  <th className="px-6 py-3 text-left text-xs">Category</th>
                  <th className="px-6 py-3 text-left text-xs">Subcategory</th>
                  <th className="px-6 py-3 text-left text-xs">Price</th>
                  <th className="px-6 py-3 text-left text-xs">Stock</th>
                  <th className="px-6 py-3 text-left text-xs">Brand</th>
                  <th className="px-6 py-3 text-left text-xs">Status</th>
                  <th className="px-6 py-3 text-left text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">{p.imageUrl && <image src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded" />}</td>
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4">{p.sku}</td>
                    <td className="px-6 py-4">{p.category}</td>
                    <td className="px-6 py-4">{p.subcategory}</td>
                    {/* ✅ updated to INR */}
                    <td className="px-6 py-4">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4">{p.stock}</td>
                    <td className="px-6 py-4">{p.brand}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        getStockStatus(p.stock) === 'In Stock' 
                          ? 'bg-green-100 text-green-800' 
                          : getStockStatus(p.stock) === 'Low Stock' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {getStockStatus(p.stock)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/products/edit/${p.id}`} className="text-indigo-600 mr-2">Edit</Link>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && <p className="text-center py-6 text-gray-500">No products found.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
