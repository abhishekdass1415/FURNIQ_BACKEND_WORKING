'use client'

import { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // This useEffect runs once when the application loads to fetch all products from the API.
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

  /**
   * Corresponds to: createProduct API
   * Adds a new product to the database and updates the local state to reflect the change.
   */
  const addProduct = async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to create product");
      const newProduct = await response.json();
      setProducts(prev => [...prev, newProduct]); // Add the new product to the list
    } catch (error) { // <-- ERROR WAS HERE
      console.error("Error adding product:", error);
    }
  };

  /**
   * Corresponds to: updateProduct API
   * Updates a product in the database and refreshes the local state.
   */
  const updateProduct = async (productId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to update product");
      const updatedProductFromServer = await response.json();
      // Update the product in the local list
      setProducts(prev => prev.map(p => (p.id === productId ? { ...p, ...updatedProductFromServer } : p)));
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
    }
  };

  /**
   * This function "archives" a product by updating its status.
   * This is safer than a hard delete and corresponds to your "delete" logic.
   */
  const deleteProduct = async (productId) => {
    // We call the main updateProduct function to change the status, which archives the product.
    await updateProduct(productId, { status: 'archived' });
  };

  // The value object provides all necessary data and functions to the rest of the app.
  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
