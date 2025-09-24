'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/context/ProductContext' // added
import Link from 'next/link'


// Categories will be fetched from backend API
export default function AddProduct() {
  const router = useRouter()
  const { addProduct } = useProducts() // added
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: '', subcategory: '', price: '', stock: '', lowStock: '', brand: '', color: '', material: '', warranty: '', imageUrl: '', description: ''
  })
  const [categories, setCategories] = useState([])
  const [allCategories, setAllCategories] = useState([]) // Store all categories including subcategories

  // Fetch categories from backend API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`)
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

  const getSubcategories = () => {
    if (!newProduct.category) return []
    // Find the selected category by name and get its subcategories
    const selectedCategory = categories.find(c => c.name === newProduct.category)
    if (!selectedCategory) return []
    
    // Find all subcategories that have this category as parent
    return allCategories.filter(cat => cat.parentId === selectedCategory.id)
  }

  const handleAddProduct = (e) => {
    e.preventDefault()
    addProduct(newProduct) // added: saves product to context
    router.push('/products')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'category') {
      // Reset subcategory when category changes
      setNewProduct({ ...newProduct, [name]: value, subcategory: '' })
    } else {
      setNewProduct({ ...newProduct, [name]: value })
    }
  }

  return (
    <div className="md:ml-64 pt-16">
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Add New Product</h2>
          <Link href="/products" className="btn-secondary">Back</Link>
        </div>

        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow">
          <input name="name" value={newProduct.name} onChange={handleChange} required placeholder="Product Name *" className="border px-3 py-2 rounded" />
          <input name="sku" value={newProduct.sku} onChange={handleChange} required placeholder="SKU *" className="border px-3 py-2 rounded" />
          <select name="category" value={newProduct.category} onChange={handleChange} required className="border px-3 py-2 rounded">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select name="subcategory" value={newProduct.subcategory} onChange={handleChange} required disabled={!newProduct.category} className="border px-3 py-2 rounded">
            <option value="">Select Subcategory</option>
            {getSubcategories().map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>

          {/* ✅ Updated Price input with Indian Rupees formatting */}
          <input
            type="text"
            name="price"
            value={newProduct.price}
            onChange={(e) => {
              let raw = e.target.value.replace(/\D/g, "")
              let formatted = raw
                ? new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0
                  }).format(raw)
                : ""
              setNewProduct({ ...newProduct, price: formatted })
            }}
            placeholder="Price *"
            required
            className="border px-3 py-2 rounded"
          />

          <input type="number" name="stock" value={newProduct.stock} onChange={handleChange} placeholder="Stock *" required className="border px-3 py-2 rounded" />
          <input type="number" name="lowStock" value={newProduct.lowStock} onChange={handleChange} placeholder="Low Stock Alert" className="border px-3 py-2 rounded" />
          <input name="brand" value={newProduct.brand} onChange={handleChange} placeholder="Brand" className="border px-3 py-2 rounded" />
          <input name="color" value={newProduct.color} onChange={handleChange} placeholder="Color" className="border px-3 py-2 rounded" />
          <input name="material" value={newProduct.material} onChange={handleChange} placeholder="Material" className="border px-3 py-2 rounded" />
          <input name="warranty" value={newProduct.warranty} onChange={handleChange} placeholder="Warranty" className="border px-3 py-2 rounded" />
          <input name="imageUrl" value={newProduct.imageUrl} onChange={handleChange} placeholder="Image URL" className="border px-3 py-2 rounded" />
          <textarea name="description" value={newProduct.description} onChange={handleChange} placeholder="Description" rows={3} className="md:col-span-2 border px-3 py-2 rounded"></textarea>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Link href="/products" className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}
