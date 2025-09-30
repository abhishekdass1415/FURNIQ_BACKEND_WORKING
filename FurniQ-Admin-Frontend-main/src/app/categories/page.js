'use client'

import React, { useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useCategories } from '@/context/CategoryContext';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CategoryManagement() {
  const { categories, addCategory, addSubcategory, loading } = useCategories();
  const { products } = useProducts();

  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingSubTo, setAddingSubTo] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory({ name: newCategoryName });
    setNewCategoryName('');
    setShowAddCategoryForm(false);
  };

  const handleAddSubcategory = async (e, parentId) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;
    await addSubcategory(parentId, { name: newSubcategoryName });
    setNewSubcategoryName('');
    setAddingSubTo(null);
  };

  if (loading) {
    return <div className="text-center p-10">Loading categories...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
        {!showAddCategoryForm && (
          <button className="btn-primary" onClick={() => setShowAddCategoryForm(true)}>
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
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
              <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-indigo-600"><PencilIcon className="w-5 h-5" /></button>
                <button className="text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Subcategories */}
            <div className="p-4 pt-3 border-b">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-medium text-gray-600">Subcategories:</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {(category.subcategories || []).map(sub => (
                    <span key={sub.id} className="inline-flex items-center gap-x-2 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                      {sub.name}
                    </span>
                  ))}
                  <button onClick={() => setAddingSubTo(category.id)} className="text-sm text-indigo-600 hover:underline hover:text-indigo-800">+ Add</button>
                </div>
              </div>
            </div>

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

            {/* Products per Subcategory */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="th-style">Product</th>
                    <th className="th-style">SKU</th>
                    <th className="th-style text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(category.subcategories || []).map(sub => {
                    const productsInSubcategory = products.filter(p =>
                      p.category === category.name &&
                      p.subcategory === sub.name &&
                      p.status === 'active'
                    );

                    return (
                      <React.Fragment key={sub.id}>
                        <tr className="border-t border-gray-200">
                          <td colSpan="3" className="px-6 py-3 bg-gray-50">
                            <h4 className="text-sm font-semibold text-gray-700">{sub.name}</h4>
                          </td>
                        </tr>
                        {productsInSubcategory.length > 0 ? (
                          productsInSubcategory.map(p => (
                            <tr key={p.id} className="align-middle">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                  <img src={p.imageUrl || 'https://via.placeholder.com/60'} alt={p.name} className="h-14 w-14 rounded-md object-cover border border-gray-200" />
                                  <span className="font-medium text-gray-900">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md">{p.sku}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <Link href={`/products/${p.id}`} className="btn-secondary-sm">View</Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                              No products in this subcategory.
                            </td>
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
