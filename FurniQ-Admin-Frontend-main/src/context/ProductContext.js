'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const ProductContext = createContext()

export const useProducts = () => useContext(ProductContext)

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/products') // Replace with your API endpoint
      setProducts(res.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Add a new product
  const addProduct = async (productData) => {
    try {
      const res = await axios.post('/api/products', productData)
      setProducts(prev => [res.data, ...prev])
      setError(null)
    } catch (err) {
      console.error('Error adding product:', err)
      setError('Failed to add product')
    }
  }

  // Update an existing product
  const updateProduct = async (productId, updatedData) => {
    try {
      const res = await axios.put(`/api/products/${productId}`, updatedData)
      setProducts(prev => prev.map(p => p.id === productId ? res.data : p))
      setError(null)
    } catch (err) {
      console.error('Error updating product:', err)
      setError('Failed to update product')
    }
  }

  // Soft delete / archive a product
  const deleteProduct = async (productId) => {
    try {
      const res = await axios.patch(`/api/products/${productId}`, { status: 'archived' })
      setProducts(prev => prev.map(p => p.id === productId ? res.data : p))
      setError(null)
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product')
    }
  }

  // Stock status helper
  const getStockStatus = (stock) => {
    if (stock > 10) return 'In Stock'
    if (stock > 0) return 'Low Stock'
    return 'Out of Stock'
  }

  const value = { 
    products, 
    loading, 
    error, 
    fetchProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    getStockStatus 
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}
