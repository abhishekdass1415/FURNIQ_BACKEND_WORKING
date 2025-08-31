'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useProducts } from '@/context/ProductContext'
import Link from 'next/link'

const categories = [
  { id: 1, name: 'Sofas & Couches', subcategories: [{ id: 101, name: 'Sectional Sofas' }, { id: 102, name: 'Loveseats' }] },
  { id: 2, name: 'Dining Tables', subcategories: [{ id: 201, name: 'Wooden Dining Tables' }] },
  { id: 3, name: 'Beds', subcategories: [{ id: 301, name: 'King Size Beds' }, { id: 302, name: 'Queen Size Beds' }] },
]

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const { products, updateProduct } = useProducts() // use context
  const productId = parseInt(params.id)
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const productData = products.find(p => p.id === productId)
    if (productData) setProduct(productData)
  }, [productId, products])

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value })

  const handleUpdate = (e) => {
    e.preventDefault()
    updateProduct(productId, product) // update via context
    router.push('/products')
  }

  if (!product) return <p>Loading...</p>

  const getSubcategories = () => categories.find(c => c.name === product.category)?.subcategories || []

  return (
    <div className="md:ml-64 pt-16">
      <div className="p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Edit Product</h2>
          <Link href="/products" className="btn-secondary">Back</Link>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded shadow">
          <input name="name" value={product.name} onChange={handleChange} required className="border px-3 py-2 rounded" />
          <input name="sku" value={product.sku} onChange={handleChange} required className="border px-3 py-2 rounded" />
          
          <select name="category" value={product.category} onChange={handleChange} required className="border px-3 py-2 rounded">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          
          <select name="subcategory" value={product.subcategory} onChange={handleChange} required className="border px-3 py-2 rounded" disabled={!product.category}>
            <option value="">Select Subcategory</option>
            {getSubcategories().map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>

          {/* ✅ Updated Price input with Indian Rupees formatting */}
          <input
            type="text"
            name="price"
            value={product.price}
            onChange={(e) => {
              let raw = e.target.value.replace(/\D/g, "")
              let formatted = raw
                ? new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0
                  }).format(raw)
                : ""
              setProduct({ ...product, price: formatted })
            }}
            className="border px-3 py-2 rounded"
          />

          <input type="number" name="stock" value={product.stock} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input type="number" name="lowStock" value={product.lowStock} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="brand" value={product.brand} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="color" value={product.color} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="material" value={product.material} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="warranty" value={product.warranty} onChange={handleChange} className="border px-3 py-2 rounded" />
          <input name="imageUrl" value={product.imageUrl} onChange={handleChange} className="border px-3 py-2 rounded" />
          
          <textarea name="description" value={product.description} onChange={handleChange} rows={3} className="md:col-span-2 border px-3 py-2 rounded" />

          <button type="submit" className="btn-primary md:col-span-2">Update Product</button>
        </form>
      </div>
    </div>
  )
}
