'use client'

import { createContext, useContext, useState, useEffect } from 'react';

const CategoryContext = createContext();

export const useCategories = () => useContext(CategoryContext);

// The base URL for your API is read from your .env file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  // This useEffect runs once to fetch all categories from your backend
  useEffect(() => {
    const fetchCategories = async () => {
      if (!API_BASE_URL) {
        console.error("API URL is not defined. Please check your .env.local file.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        // Ensure subcategories is always an array to prevent UI errors
        const formattedData = data.map(cat => ({ ...cat, subcategories: cat.subcategories || [] }));
        setCategories(formattedData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // --- CATEGORY API FUNCTIONS ---

  /**
   * Corresponds to: createCategory API
   * Adds a new category and updates the local state.
   */
  const addCategory = async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryData.name, subcategories: [] }), // Send new category to API
      });
      if (!response.ok) throw new Error("Failed to create category");
      const newCategory = await response.json();
      // Add the new category from the server to our local state to update the UI
      setCategories(prev => [...prev, { ...newCategory, subcategories: newCategory.subcategories || [] }]);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  /**
   * Corresponds to: updateCategory API
   * Updates a category's data and refreshes the local state.
   */
  const updateCategory = async (categoryId, updatedData) => {
    try {
      // Find the existing category to merge data, ensuring we don't overwrite fields
      const existingCategory = categories.find(c => c.id === categoryId);
      if (!existingCategory) return;

      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...existingCategory, ...updatedData }), // Send the merged updated data
      });
      if (!response.ok) throw new Error("Failed to update category");
      const updatedCategoryFromServer = await response.json();
      // Update the category in our local state
      setCategories(prev => prev.map(cat => (cat.id === categoryId ? { ...cat, ...updatedCategoryFromServer } : cat)));
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  /**
   * Corresponds to: deleteCategory API
   * Deletes a category and removes it from the local state.
   */
  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Failed to delete category");
      // Remove the category from our local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // --- SUBCATEGORY API FUNCTIONS ---
  // Subcategories are part of the main category object, so we just update the parent.

  const addSubcategory = async (parentId, subcategoryName) => {
    const parentCategory = categories.find(cat => cat.id === parentId);
    if (!parentCategory) return;

    // The backend should handle creating the ID for the new subcategory
    const newSub = { name: subcategoryName };
    const updatedSubcategories = [...(parentCategory.subcategories || []), newSub];

    // Call the main update function with the new subcategories array
    await updateCategory(parentId, { subcategories: updatedSubcategories });
  };

  const deleteSubcategory = async (parentId, subId) => {
    const parentCategory = categories.find(cat => cat.id === parentId);
    if (!parentCategory) return;

    const updatedSubcategories = parentCategory.subcategories.filter(sub => sub.id !== subId);
    await updateCategory(parentId, { subcategories: updatedSubcategories });
  };

  // The value provided to consuming components
  const value = {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};