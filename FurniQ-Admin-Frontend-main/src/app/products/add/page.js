'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProducts } from '@/context/ProductContext'
import { useInventory } from '@/context/InventoryContext'
import { useCategories } from '@/context/CategoryContext' // Import category context
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const labelClasses = "block text-sm font-medium text-gray-700";
const inputClasses = "block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3";


export default function AddProduct() {
  const router = useRouter()
  const { addProduct } = useProducts()
  const { addLog } = useInventory()
  const { categories } = useCategories(); // Get dynamic categories
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: '', subcategory: '', price: '', stock: '', lowStock: '',
    brand: '', color: '', material: '', style: '', size: '', warranty: '', imageUrl: '', description: ''
  })

  const getSubcategories = () => {
    if (!newProduct.category) return []
    return categories.find(c => c.name === newProduct.category)?.subcategories || []
  }

  const handleAddProduct = (e) => {
    e.preventDefault()

    // 1. Add the product
    addProduct(newProduct)

    // 2. Automatically create an inventory log for the initial stock
    const stockNumber = parseInt(newProduct.stock, 10);
    if (!isNaN(stockNumber) && stockNumber > 0) {
      addLog({
        productId: newProduct.sku,
        change: stockNumber,
        reason: 'Initial Stock',
        notes: 'Product created and added to system.',
        userId: 'admin'
      });
    }

    // 3. Redirect to the products page
    router.push('/products')
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
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

            <div className="md:col-span-1">
              <label htmlFor="name" className={labelClasses}>Product Name *</label>
              <input id="name" name="name" value={newProduct.name} onChange={handleChange} required className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="sku" className={labelClasses}>SKU *</label>
              <input id="sku" name="sku" value={newProduct.sku} onChange={handleChange} required className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="category" className={labelClasses}>Category *</label>
              <select id="category" name="category" value={newProduct.category} onChange={handleChange} required className={inputClasses}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="subcategory" className={labelClasses}>Subcategory *</label>
              <select id="subcategory" name="subcategory" value={newProduct.subcategory} onChange={handleChange} required disabled={!newProduct.category} className={`${inputClasses} disabled:bg-gray-100`}>
                <option value="">Select Subcategory</option>
                {getSubcategories().map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="price" className={labelClasses}>Price (INR) *</label>
              <input id="price" type="text" name="price" value={newProduct.price} onChange={handlePriceChange} required className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="stock" className={labelClasses}>Stock Quantity *</label>
              <input id="stock" type="number" name="stock" value={newProduct.stock} onChange={handleChange} placeholder="e.g., 50" required className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="lowStock" className={labelClasses}>Low Stock Threshold</label>
              <input id="lowStock" type="number" name="lowStock" value={newProduct.lowStock} onChange={handleChange} placeholder="e.g., 10" className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="brand" className={labelClasses}>Brand</label>
              <input id="brand" name="brand" value={newProduct.brand} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="material" className={labelClasses}>Material</label>
              <input id="material" name="material" value={newProduct.material} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="color" className={labelClasses}>Color</label>
              <input id="color" name="color" value={newProduct.color} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="style" className={labelClasses}>Style</label>
              <input id="style" name="style" value={newProduct.style} onChange={handleChange} placeholder="e.g., Modern, Vintage" className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="size" className={labelClasses}>Size</label>
              <input id="size" name="size" value={newProduct.size} onChange={handleChange} placeholder="e.g., 6x4 ft" className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="warranty" className={labelClasses}>Warranty</label>
              <input id="warranty" name="warranty" value={newProduct.warranty} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="imageUrl" className={labelClasses}>Image URL</label>
              <input id="imageUrl" name="imageUrl" value={newProduct.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" className={inputClasses} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClasses}>Description</label>
              <textarea id="description" name="description" value={newProduct.description} onChange={handleChange} rows={6} className={inputClasses}></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Link href="/products" className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  )
}