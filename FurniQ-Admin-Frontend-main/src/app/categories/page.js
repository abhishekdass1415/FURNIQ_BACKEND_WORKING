'use client'

import React, { useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useCategories } from '@/context/CategoryContext'; // Use the updated context
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// A simple loading spinner component to show while fetching data
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

export default function CategoryManagement() {
  // Get all data and functions directly from the context
  const {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory
  } = useCategories();

  const { products } = useProducts();

  // State for managing UI forms and inputs
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [addingSubTo, setAddingSubTo] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  // --- Event Handlers ---

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory({ name: newCategoryName.trim() });
    setNewCategoryName('');
    setShowAddCategoryForm(false);
  };

  const handleEditCategoryClick = (category) => {
    setEditingCatId(category.id);
    setEditingCatName(category.name);
  };

  const handleSaveCategory = async (id) => {
    if (!editingCatName.trim()) return;
    await updateCategory(id, { name: editingCatName.trim() });
    setEditingCatId(null);
    setEditingCatName('');
  };

  const handleDeleteCategoryClick = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"? This will also remove its subcategories.`)) {
      deleteCategory(id);
    }
  };

  const handleAddSubcategory = async (e, parentId) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;
    await addSubcategory(parentId, newSubcategoryName.trim());
    setNewSubcategoryName('');
    setAddingSubTo(null);
  };

  // Show a loading spinner while data is being fetched
  if (loading) {
    return <LoadingSpinner />;
  }

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

      {/* Form for adding a new category */}
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
              <button type="button" className="btn-secondary" onClick={() => setShowAddCategoryForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of all categories */}
      <div className="space-y-8">
        {categories.map(category => (
          <div key={category.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Main Category Header with Edit/Delete */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              {editingCatId === category.id ? (
                <input
                  type="text"
                  value={editingCatName}
                  onChange={(e) => setEditingCatName(e.target.value)}
                  className="input-style !mt-0 text-xl font-semibold"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory(category.id)}
                  autoFocus
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
              )}
              <div className="flex items-center space-x-4">
                {editingCatId === category.id ? (
                  <>
                    <button onClick={() => handleSaveCategory(category.id)} className="text-green-600 hover:text-green-800"><CheckIcon className="w-6 h-6" /></button>
                    <button onClick={() => setEditingCatId(null)} className="text-red-500 hover:text-red-700"><XMarkIcon className="w-6 h-6" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditCategoryClick(category)} className="text-gray-500 hover:text-indigo-600"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteCategoryClick(category.id, category.name)} className="text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                  </>
                )}
              </div>
            </div>

            {/* Subcategories Section with Delete */}
            <div className="p-4 pt-3 border-b">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Subcategories:</h3>
              <div className="flex flex-wrap items-center gap-2">
                {(category.subcategories || []).map(sub => (
                  <span key={sub.id} className="inline-flex items-center group bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                    {sub.name}
                    <button onClick={() => deleteSubcategory(category.id, sub.id)} className="ml-2 text-red-400 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                <button onClick={() => setAddingSubTo(category.id)} className="text-sm text-indigo-600 hover:underline hover:text-indigo-800">
                  + Add
                </button>
              </div>
            </div>

            {/* Form for Adding a Subcategory */}
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
                    <button type="button" className="btn-secondary" onClick={() => { setAddingSubTo(null); setNewSubcategoryName(''); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* The products table can remain as it was */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Your existing JSX for the products table goes here */}
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}