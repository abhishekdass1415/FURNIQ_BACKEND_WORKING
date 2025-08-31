'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const ProductContext = createContext()

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ Function to check stock status
  const getStockStatus = (stock) => {
    if (stock === 0) return "Out of Stock"
    if (stock < 5) return "Low Stock"
    return "In Stock"
  }

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { getApiService, createFallbackApiService } = await import('../../lib/apiHelper.js')
      
      try {
        const apiService = await getApiService()
        const data = await apiService.getProducts()
        setProducts(data)
        setError(null)
      } catch (apiError) {
        console.warn('API service not available, using fallback:', apiError)
        const fallbackService = createFallbackApiService()
        const data = await fallbackService.getProducts()
        setProducts(data)
        setError('Backend server is not running. Using offline mode.')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Load products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const addProduct = async (product) => {
    try {
      const { getApiService, createFallbackApiService } = await import('../../lib/apiHelper.js')
      
      try {
        const apiService = await getApiService()
        const newProduct = await apiService.createProduct(product)
        setProducts(prev => [...prev, { ...newProduct, status: getStockStatus(newProduct.stock) }])
        return newProduct
      } catch (apiError) {
        console.warn('API service not available, using fallback:', apiError)
        const fallbackService = createFallbackApiService()
        const newProduct = await fallbackService.createProduct(product)
        setProducts(prev => [...prev, { ...newProduct, status: getStockStatus(newProduct.stock) }])
        return newProduct
      }
    } catch (err) {
      console.error('Error adding product:', err)
      throw err
    }
  }

  const updateProduct = async (id, updatedProduct) => {
    try {
      const { getApiService, createFallbackApiService } = await import('../../lib/apiHelper.js')
      
      try {
        const apiService = await getApiService()
        const updated = await apiService.updateProduct(id, updatedProduct)
        setProducts(prev => 
          prev.map(p => 
            p.id === id 
              ? { ...updated, status: getStockStatus(updated.stock) }
              : p
          )
        )
        return updated
      } catch (apiError) {
        console.warn('API service not available, using fallback:', apiError)
        const fallbackService = createFallbackApiService()
        const updated = await fallbackService.updateProduct(id, updatedProduct)
        setProducts(prev => 
          prev.map(p => 
            p.id === id 
              ? { ...updated, status: getStockStatus(updated.stock) }
              : p
          )
        )
        return updated
      }
    } catch (err) {
      console.error('Error updating product:', err)
      throw err
    }
  }

  const deleteProduct = async (id) => {
    try {
      const { getApiService, createFallbackApiService } = await import('../../lib/apiHelper.js')
      
      try {
        const apiService = await getApiService()
        await apiService.deleteProduct(id)
        setProducts(prev => prev.filter(p => p.id !== id))
      } catch (apiError) {
        console.warn('API service not available, using fallback:', apiError)
        const fallbackService = createFallbackApiService()
        await fallbackService.deleteProduct(id)
        setProducts(prev => prev.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      throw err
    }
  }

  return (
    <ProductContext.Provider value={{ 
      products, 
      loading, 
      error, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      getStockStatus,
      refreshProducts: fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => useContext(ProductContext)
