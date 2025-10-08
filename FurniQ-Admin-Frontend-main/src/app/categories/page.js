'use client'

import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

// A simple modal component for confirmations, included in the same file.
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="text-sm text-gray-600 mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};


export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Mock products to avoid dependency error from useProducts context
  const products = [];

  // UI State
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingSubTo, setAddingSubTo] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState({ id: null, name: '' });
  const [editingSubcategory, setEditingSubcategory] = useState({ parentId: null, id: null, name: '' });
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, parentId }

  // --- Data Fetching ---
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(new URL('/api/categories', window.location.origin));
      if (!res.ok) throw new Error('Failed to fetch categories.');
      const data = await res.json();
      // Assuming subcategories might be stored as a JSON string in your database
      const parsedData = data.map(cat => ({
        ...cat,
        subcategories: Array.isArray(cat.subcategories) ? cat.subcategories : [],
      }));
      setCategories(parsedData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- API Handlers ---

  const handleApiUpdate = async (categoryId, updatedCategoryData) => {
    const res = await fetch(new URL(`/api/categories/${categoryId}`, window.location.origin), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCategoryData),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update category.');
    }
    return res.json();
  };

  // --- Category CRUD ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch(new URL('/api/categories', window.location.origin), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, subcategories: [] }),
      });
      if (!res.ok) throw new Error('Failed to create category.');
      await fetchCategories(); // Refetch to get the latest state
      setNewCategoryName('');
      setShowAddCategoryForm(false);
    } catch (err) {
      // In a real app, you might set an error state here
      console.error(`Error: ${err.message}`);
    }
  };

  const handleUpdateCategoryName = async (e) => {
    e.preventDefault();
    const { id, name } = editingCategory;
    const originalCategory = categories.find(c => c.id === id);
    if (!name.trim() || name === originalCategory.name) {
      setEditingCategory({ id: null, name: '' });
      return;
    }
    try {
      await handleApiUpdate(id, { ...originalCategory, name });
      await fetchCategories();
      setEditingCategory({ id: null, name: '' });
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(new URL(`/api/categories/${id}`, window.location.origin), { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category.');
      setCategories(categories.filter(c => c.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  // --- Subcategory CRUD ---
  const handleAddSubcategory = async (e, parentId) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;
    const parentCategory = categories.find(c => c.id === parentId);
    const newSub = { id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: newSubcategoryName };
    const updatedSubcategories = [...parentCategory.subcategories, newSub];

    try {
      await handleApiUpdate(parentId, { ...parentCategory, subcategories: updatedSubcategories });
      await fetchCategories();
      setNewSubcategoryName('');
      setAddingSubTo(null);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const handleUpdateSubcategory = async (e) => {
    e.preventDefault();
    const { parentId, id, name } = editingSubcategory;
    const parentCategory = categories.find(c => c.id === parentId);
    if (!name.trim() || !parentCategory) {
      setEditingSubcategory({ parentId: null, id: null, name: '' });
      return;
    }
    const updatedSubcategories = parentCategory.subcategories.map(sub =>
      sub.id === id ? { ...sub, name } : sub
    );
    try {
      await handleApiUpdate(parentId, { ...parentCategory, subcategories: updatedSubcategories });
      await fetchCategories();
      setEditingSubcategory({ parentId: null, id: null, name: '' });
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const handleDeleteSubcategory = async (parentId, subId) => {
    const parentCategory = categories.find(c => c.id === parentId);
    const updatedSubcategories = parentCategory.subcategories.filter(sub => sub.id !== subId);
    try {
      await handleApiUpdate(parentId, { ...parentCategory, subcategories: updatedSubcategories });
      setCategories(categories.map(cat =>
        cat.id === parentId ? { ...cat, subcategories: updatedSubcategories } : cat
      ));
      setDeleteTarget(null);
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  };

  const confirmDeletion = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'category') {
      handleDeleteCategory(deleteTarget.id);
    } else if (deleteTarget.type === 'subcategory') {
      handleDeleteSubcategory(deleteTarget.parentId, deleteTarget.id);
    }
  };

  if (loading) return <div className="text-center p-10">Loading categories...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full">
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeletion}
        title="Confirm Deletion"
      >
        Are you sure you want to delete this item? This action cannot be undone.
      </ConfirmationModal>

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
            <input type="text" placeholder="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="input-style !mt-0 flex-grow" required autoFocus />
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
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              {editingCategory.id === category.id ? (
                <form onSubmit={handleUpdateCategoryName} className="flex-grow flex items-center gap-2">
                  <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className="input-style !mt-0 flex-grow" autoFocus />
                  <button type="submit" className="btn-primary-sm">Save</button>
                  <button type="button" onClick={() => setEditingCategory({ id: null, name: '' })} className="btn-secondary-sm">Cancel</button>
                </form>
              ) : (
                <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
              )}
              <div className="flex items-center space-x-4">
                <button onClick={() => setEditingCategory({ id: category.id, name: category.name })} className="text-gray-500 hover:text-indigo-600"><PencilIcon className="w-5 h-5" /></button>
                <button onClick={() => setDeleteTarget({ type: 'category', id: category.id })} className="text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="p-4 pt-3 border-b">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Subcategories:</h3>
              <div className="flex flex-wrap items-center gap-2">
                {category.subcategories.map(sub => (
                  <div key={sub.id} className="group inline-flex items-center bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full">
                    {editingSubcategory.id === sub.id ? (
                      <form onSubmit={handleUpdateSubcategory} className="flex items-center gap-1">
                        <input type="text" value={editingSubcategory.name} onChange={e => setEditingSubcategory({ ...editingSubcategory, name: e.target.value })} className="input-style !text-sm !p-0.5 !m-0 !w-24 bg-white" autoFocus />
                        <button type="submit" className="text-indigo-600">✓</button>
                        <button type="button" onClick={() => setEditingSubcategory({ parentId: null, id: null, name: '' })} className="text-gray-500">×</button>
                      </form>
                    ) : (
                      <>
                        <span>{sub.name}</span>
                        <div className="hidden group-hover:flex items-center ml-2">
                          <button onClick={() => setEditingSubcategory({ parentId: category.id, id: sub.id, name: sub.name })} className="text-indigo-500 hover:text-indigo-700"><PencilIcon className="w-3 h-3" /></button>
                          <button onClick={() => setDeleteTarget({ type: 'subcategory', parentId: category.id, id: sub.id })} className="text-red-500 hover:text-red-700"><XMarkIcon className="w-4 h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <button onClick={() => setAddingSubTo(category.id)} className="text-sm text-indigo-600 hover:underline hover:text-indigo-800">+ Add</button>
              </div>
            </div>

            {addingSubTo === category.id && (
              <div className="p-4 bg-gray-50 border-b">
                <form onSubmit={(e) => handleAddSubcategory(e, category.id)} className="flex items-center gap-3">
                  <input type="text" placeholder="New Subcategory Name" value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} className="input-style !mt-0 flex-grow" required autoFocus />
                  <div className="flex-shrink-0 flex gap-2">
                    <button type="submit" className="btn-primary">Save</button>
                    <button type="button" className="btn-secondary" onClick={() => setAddingSubTo(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {category.subcategories.map(sub => {
                    const productsInSubcategory = products.filter(
                      p => p.category === category.name && p.subcategory === sub.name && p.status === 'active'
                    );

                    return (
                      <React.Fragment key={sub.id}>
                        <tr className="bg-gray-100"><td colSpan="3" className="px-6 py-2 text-sm font-semibold text-gray-800">{sub.name}</td></tr>
                        {productsInSubcategory.length > 0 ? (
                          productsInSubcategory.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <img src={p.imageUrl || `https://placehold.co/70x70/E0E7FF/4F46E5?text=${p.name.charAt(0)}`} alt={p.name} className="h-12 w-12 rounded-md object-cover border border-gray-200" />
                                  <span className="font-medium text-gray-900">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"><span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md">{p.sku}</span></td>
                              <td className="px-6 py-4 whitespace-nowrap text-right"><a href={`/products/${p.id}`} className="btn-secondary-sm">View</a></td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 bg-gray-50">No active products in this subcategory.</td></tr>
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


