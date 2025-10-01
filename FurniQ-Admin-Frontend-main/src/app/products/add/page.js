'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/context/ProductContext'
import { useInventory } from '@/context/InventoryContext'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const categories = [
  { id: 1, name: 'Furniture', subcategories: [{ id: 101, name: 'Sofas' }, { id: 102, name: 'Tables' }, { id: 103, name: 'Bed' }] },
  { id: 2, name: 'Kitchen & Dining', subcategories: [{ id: 201, name: 'Dining Sets' }, { id: 202, name: 'Cookware' }] },
  { id: 3, name: 'Home Decor', subcategories: [{ id: 301, name: 'Lighting' }, { id: 302, name: 'Wall Art' }] },
  { id: 4, name: 'Home Furnishing', subcategories: [{ id: 401, name: 'Cushions' }, { id: 402, name: 'Carpets' }] },
]

const labelClasses = "block text-sm font-medium text-gray-700";
const inputClasses = "block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3";

export default function AddProduct() {
  const router = useRouter()
  const { addProduct } = useProducts()
  const { addLog } = useInventory()
  
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: '', subcategory: '', price: '', stock: '', lowStock: '', 
    brand: '', color: '', material: '', style: '', size: '', warranty: '', imageUrl: '', description: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getSubcategories = () => {
    if (!newProduct.category) return []
    return categories.find(c => c.name === newProduct.category)?.subcategories || []
  }

  const handleChange = (e) => setNewProduct({ ...newProduct, [e.target.name]: e.target.value })

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = rawValue 
      ? new Intl.NumberFormat("en-IN", {
          style: "currency", currency: "INR", maximumFractionDigits: 0
        }).format(rawValue)
      : "";
    setNewProduct({ ...newProduct, price: formattedValue });
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Send POST request to backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newProduct, 
          price: parseInt(newProduct.price.replace(/\D/g, ''), 10), // convert formatted price to number
          stock: parseInt(newProduct.stock, 10),
          lowStock: newProduct.lowStock ? parseInt(newProduct.lowStock, 10) : 0
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to add product')
      }

      const savedProduct = await response.json()

      // 2. Update frontend context
      addProduct(savedProduct)

      // 3. Automatically create inventory log
      if (savedProduct.stock > 0) {
        addLog({
          productId: savedProduct.sku,
          change: savedProduct.stock,
          reason: 'Initial Stock',
          notes: 'Product created and added to system.',
          userId: 'admin'
        })
      }

      // 4. Redirect
      router.push('/products')

    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
        <Link href="/products" className="btn-secondary flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleAddProduct} className="space-y-6">
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Product Name */}
            <div className="md:col-span-1">
              <label htmlFor="name" className={labelClasses}>Product Name *</label>
              <input id="name" name="name" value={newProduct.name} onChange={handleChange} required className={inputClasses} />
            </div>

            {/* SKU */}
            <div className="md:col-span-1">
              <label htmlFor="sku" className={labelClasses}>SKU *</label>
              <input id="sku" name="sku" value={newProduct.sku} onChange={handleChange} required className={inputClasses} />
            </div>

            {/* Category */}
            <div className="md:col-span-1">
              <label htmlFor="category" className={labelClasses}>Category *</label>
              <select id="category" name="category" value={newProduct.category} onChange={handleChange} required className={inputClasses}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Subcategory */}
            <div className="md:col-span-1">
              <label htmlFor="subcategory" className={labelClasses}>Subcategory *</label>
              <select id="subcategory" name="subcategory" value={newProduct.subcategory} onChange={handleChange} required disabled={!newProduct.category} className={`${inputClasses} disabled:bg-gray-100`}>
                <option value="">Select Subcategory</option>
                {getSubcategories().map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className="md:col-span-1">
              <label htmlFor="price" className={labelClasses}>Price (INR) *</label>
              <input id="price" type="text" name="price" value={newProduct.price} onChange={handlePriceChange} required className={inputClasses} />
            </div>

            {/* Stock */}
            <div className="md:col-span-1">
              <label htmlFor="stock" className={labelClasses}>Stock Quantity *</label>
              <input id="stock" type="number" name="stock" value={newProduct.stock} onChange={handleChange} placeholder="e.g., 50" required className={inputClasses} />
            </div>

            {/* Low Stock */}
            <div className="md:col-span-1">
              <label htmlFor="lowStock" className={labelClasses}>Low Stock Threshold</label>
              <input id="lowStock" type="number" name="lowStock" value={newProduct.lowStock} onChange={handleChange} placeholder="e.g., 10" className={inputClasses} />
            </div>

            {/* Brand */}
            <div className="md:col-span-1">
              <label htmlFor="brand" className={labelClasses}>Brand</label>
              <input id="brand" name="brand" value={newProduct.brand} onChange={handleChange} className={inputClasses} />
            </div>

            {/* Material */}
            <div className="md:col-span-1">
              <label htmlFor="material" className={labelClasses}>Material</label>
              <input id="material" name="material" value={newProduct.material} onChange={handleChange} className={inputClasses} />
            </div>

            {/* Color */}
            <div className="md:col-span-1">
              <label htmlFor="color" className={labelClasses}>Color</label>
              <input id="color" name="color" value={newProduct.color} onChange={handleChange} className={inputClasses} />
            </div>

            {/* Style */}
            <div className="md:col-span-1">
              <label htmlFor="style" className={labelClasses}>Style</label>
              <input id="style" name="style" value={newProduct.style} onChange={handleChange} placeholder="e.g., Modern, Vintage" className={inputClasses} />
            </div>

            {/* Size */}
            <div className="md:col-span-1">
              <label htmlFor="size" className={labelClasses}>Size</label>
              <input id="size" name="size" value={newProduct.size} onChange={handleChange} placeholder="e.g., 6x4 ft" className={inputClasses} />
            </div>

            {/* Warranty */}
            <div className="md:col-span-1">
              <label htmlFor="warranty" className={labelClasses}>Warranty</label>
              <input id="warranty" name="warranty" value={newProduct.warranty} onChange={handleChange} className={inputClasses} />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label htmlFor="imageUrl" className={labelClasses}>Image URL</label>
              <input id="imageUrl" name="imageUrl" value={newProduct.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" className={inputClasses} />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClasses}>Description</label>
              <textarea id="description" name="description" value={newProduct.description} onChange={handleChange} rows={6} className={inputClasses}></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Link href="/products" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Adding...' : 'Add Product'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
