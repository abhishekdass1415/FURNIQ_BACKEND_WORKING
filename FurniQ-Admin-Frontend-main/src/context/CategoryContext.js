'use client'

import { createContext, useContext, useState, useEffect } from 'react';

const CategoryContext = createContext();

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // This will fetch categories from your backend when the app loads
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // In the future, this will be your actual API endpoint
        // const response = await fetch('/api/categories');
        // const data = await response.json();
        
        // For now, we use the initial data to simulate the API call
        const initialData = [
          { id: 1, name: 'Furniture', subcategories: [
              { id: 101, name: 'Sofas' }, { id: 102, name: 'Tables' }, { id: 103, name: 'Beds' }
          ]},
          { id: 2, name: 'Kitchen & Dining', subcategories: [
              { id: 201, name: 'Dining Sets' }, { id: 202, name: 'Cookware' }
          ]},
        ];
        setCategories(initialData);

      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const addCategory = async (categoryData) => {
    // This function will eventually send data to your backend
    // Example: const response = await fetch('/api/categories', { method: 'POST', ... });
    const newCategory = { id: Date.now(), ...categoryData, subcategories: [] };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const addSubcategory = async (parentId, subcategoryData) => {
    // This function will eventually send data to your backend
    // Example: const response = await fetch(`/api/categories/${parentId}/subcategories`, { method: 'POST', ... });
    const newSubcategory = { id: Date.now(), ...subcategoryData };
    setCategories(categories.map(cat => 
        cat.id === parentId 
            ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] } 
            : cat
    ));
    return newSubcategory;
  };

  const value = { categories, loading, addCategory, addSubcategory };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};