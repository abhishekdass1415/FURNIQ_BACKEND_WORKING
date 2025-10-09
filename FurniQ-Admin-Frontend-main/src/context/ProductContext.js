'use client'

import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // This useEffect hook fetches the initial list of products from your API
  // when the application first loads.
  useEffect(() => {
    const fetchProducts = async () => {
      if (!API_BASE_URL) {
        console.error("API URL is not defined. Please check your .env.local file.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // addProduct now correctly sends a POST request to create a new product.
  // The incorrect delete logic has been completely removed.
  const addProduct = async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to create product");
      const newProduct = await response.json();
      // Add the new product from the server to the local state for an instant UI update.
      setProducts(prev => [newProduct, ...prev]);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // updateProduct sends a PATCH request to update parts of a product.
  const updateProduct = async (productId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'PATCH', // Using PATCH is efficient for partial updates.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to update product");
      const updatedProductFromServer = await response.json();
      // Update the local state with the new data from the server.
      setProducts(prev => prev.map(p => (p.id === productId ? updatedProductFromServer : p)));
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
    }
  };

  // deleteProduct performs a "soft delete" by updating the product's status to 'archived'.
  const deleteProduct = async (productId) => {
    await updateProduct(productId, { status: 'archived' });
  };

  // This is a helper function to determine the stock status text.
  const getStockStatus = (stock) => {
    if (stock > 10) return 'In Stock';
    if (stock > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getStockStatus
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
