'use client'

import React, { useState, useEffect } from 'react';
import { useProducts } from '@/context/ProductContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CategoryManagement() {
  const { products, setProducts } = useProducts();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingSubTo, setAddingSubTo] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  // Fetch categories from backend on component mount
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!res.ok) throw new Error('Failed to add category');
      const addedCategory = await res.json();
      setCategories([...categories, addedCategory]);
      setNewCategoryName('');
      setShowAddCategoryForm(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Add new subcategory
  const handleAddSubcategory = async (e, parentId) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${parentId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubcategoryName }),
      });
      if (!res.ok) throw new Error('Failed to add subcategory');
      const addedSub = await res.json();
      setCategories(categories.map(cat => cat.id === parentId ? { ...cat, subcategories: [...cat.subcategories, addedSub] } : cat));
      setNewSubcategoryName('');
      setAddingSubTo(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories(categories.filter(cat => cat.id !== categoryId));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Delete subcategory
  const handleDeleteSubcategory = async (categoryId, subId) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}/subcategories/${subId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subcategory');
      setCategories(categories.map(cat => cat.id === categoryId ? {
        ...cat,
        subcategories: cat.subcategories.filter(sub => sub.id !== subId)
      } : cat));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
        {!showAddCategoryForm && (
          <button className="btn-primary flex items-center" onClick={() => setShowAddCategoryForm(true)}>
            <PlusIcon className="w-5 h-5 mr-2" /> Add New Category
          </button>
        )}
      </div>

      {showAddCategoryForm && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-medium mb-2">Add New Category</h3>
          <form onSubmit={handleAddCategory} className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="input-style !mt-0 flex-grow"
              required
              autoFocus
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setShowAddCategoryForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        {categories.map(category => (
          <div key={category.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Category Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
              <div className="flex items-center space-x-4">
                <button onClick={() => handleDeleteCategory(category.id)} className="text-gray-500 hover:text-red-600">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            <div className="p-4 pt-3 border-b">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Subcategories:</h3>
              <div className="flex flex-wrap items-center gap-2">
                {category.subcategories.map(sub => (
                  <span key={sub.id} className="inline-flex items-center gap-x-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                    {sub.name}
                    <button onClick={() => handleDeleteSubcategory(category.id, sub.id)} className="text-red-500 hover:text-red-700 ml-1">×</button>
                  </span>
                ))}
                <button onClick={() => setAddingSubTo(category.id)} className="text-sm text-indigo-600 hover:underline hover:text-indigo-800">+ Add</button>
              </div>
            </div>

            {/* Add Subcategory Form */}
            {addingSubTo === category.id && (
              <div className="p-4 bg-gray-50 border-b">
                <form onSubmit={(e) => handleAddSubcategory(e, category.id)} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="New Subcategory Name"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    className="input-style !mt-0 flex-grow"
                    required
                    autoFocus
                  />
                  <div className="flex-shrink-0 flex gap-2">
                    <button type="submit" className="btn-primary">Save</button>
                    <button type="button" className="btn-secondary" onClick={() => setAddingSubTo(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {category.subcategories.map(sub => {
                    const productsInSub = products.filter(p => p.category === category.name && p.subcategory === sub.name && p.status === 'active');
                    return (
                      <React.Fragment key={sub.id}>
                        <tr className="bg-gray-100">
                          <td colSpan="3" className="px-6 py-2 text-sm font-semibold text-gray-800">{sub.name}</td>
                        </tr>
                        {productsInSub.length > 0 ? productsInSub.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <img src={p.imageUrl || 'https://via.placeholder.com/70'} alt={p.name} className="h-12 w-12 rounded-md object-cover border border-gray-200"/>
                                <span className="font-medium text-gray-900">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md">{p.sku}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Link href={`/products/${p.id}`} className="btn-secondary-sm">View</Link>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 bg-gray-50">No products in this subcategory.</td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
