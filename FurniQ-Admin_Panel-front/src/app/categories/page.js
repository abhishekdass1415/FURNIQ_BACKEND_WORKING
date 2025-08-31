'use client'

import { useState } from 'react'

// ✅ Sample categories with subcategories
const initialCategories = [
  {
    id: 1,
    name: 'Sofas & Couches',
    imageUrl: 'https://via.placeholder.com/150',
    subcategories: [
      { id: 101, name: 'Sectional Sofas', imageUrl: 'https://via.placeholder.com/100' },
      { id: 102, name: 'Loveseats', imageUrl: 'https://via.placeholder.com/100' },
    ]
  },
  {
    id: 2,
    name: 'Dining Tables',
    imageUrl: 'https://via.placeholder.com/150',
    subcategories: [
      { id: 201, name: 'Wooden Dining Tables', imageUrl: 'https://via.placeholder.com/100' },
      { id: 202, name: 'Glass Dining Tables', imageUrl: 'https://via.placeholder.com/100' },
    ]
  }
]

export default function CategoryManagement() {
  const [categories, setCategories] = useState(initialCategories)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddSubcategory, setShowAddSubcategory] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newCategory, setNewCategory] = useState({ name: '', imageUrl: '' })
  const [newSubcategory, setNewSubcategory] = useState({ name: '', imageUrl: '' })
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingSubcategory, setEditingSubcategory] = useState(null)

  const handleAddCategory = (e) => {
    e.preventDefault()
    const category = {
      id: Date.now(),
      name: newCategory.name,
      imageUrl: newCategory.imageUrl || 'https://via.placeholder.com/150',
      subcategories: []
    }
    setCategories([...categories, category])
    setNewCategory({ name: '', imageUrl: '' })
    setShowAddCategory(false)
  }

  const handleAddSubcategory = (e) => {
    e.preventDefault()
    if (!selectedCategory) return

    const subcategory = {
      id: Date.now(),
      name: newSubcategory.name,
      imageUrl: newSubcategory.imageUrl || 'https://via.placeholder.com/100'
    }

    const updatedCategories = categories.map(category => {
      if (category.id === parseInt(selectedCategory)) {
        return {
          ...category,
          subcategories: [...category.subcategories, subcategory]
        }
      }
      return category
    })
    setCategories(updatedCategories)
    setNewSubcategory({ name: '', imageUrl: '' })
    setShowAddSubcategory(false)
  }

  const handleEditCategory = (e) => {
    e.preventDefault()
    const updatedCategories = categories.map(category => {
      if (category.id === editingCategory.id) {
        return {
          ...category,
          name: editingCategory.name,
          imageUrl: editingCategory.imageUrl
        }
      }
      return category
    })
    setCategories(updatedCategories)
    setEditingCategory(null)
  }

  const handleEditSubcategory = (e) => {
    e.preventDefault()
    const updatedCategories = categories.map(category => {
      if (category.id === editingSubcategory.categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.map(sub => {
            if (sub.id === editingSubcategory.id) {
              return {
                ...sub,
                name: editingSubcategory.name,
                imageUrl: editingSubcategory.imageUrl
              }
            }
            return sub
          })
        }
      }
      return category
    })
    setCategories(updatedCategories)
    setEditingSubcategory(null)
  }

  const handleDeleteCategory = (id) => {
    if (window.confirm('Delete this category and all its subcategories?')) {
      setCategories(categories.filter(category => category.id !== id))
    }
  }

  const handleDeleteSubcategory = (categoryId, subcategoryId) => {
    if (window.confirm('Delete this subcategory?')) {
      const updatedCategories = categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            subcategories: category.subcategories.filter(sub => sub.id !== subcategoryId)
          }
        }
        return category
      })
      setCategories(updatedCategories)
    }
  }

  return (
    <div className="md:ml-64 pt-16">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Category Management</h2>
          <div className="flex space-x-4">
            <button className="btn-secondary" onClick={() => setShowAddSubcategory(true)}>
              Add Subcategory
            </button>
            <button className="btn-primary" onClick={() => setShowAddCategory(true)}>
              Add Category
            </button>
          </div>
        </div>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newCategory.imageUrl}
                  onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-3">
                <button type="button" className="btn-secondary" onClick={() => setShowAddCategory(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Category</button>
              </div>
            </form>
          </div>
        )}

        {/* Add Subcategory Form */}
        {showAddSubcategory && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Subcategory</h3>
            <form onSubmit={handleAddSubcategory} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  value={newSubcategory.name}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={!selectedCategory}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newSubcategory.imageUrl}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!selectedCategory}
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-3">
                <button type="button" className="btn-secondary" onClick={() => setShowAddSubcategory(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={!selectedCategory}>Add Subcategory</button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Categories & Subcategories</h3>
          </div>
          <div className="px-4 py-5">
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category.id} className="border rounded-lg p-4">
                  {/* ✅ Edit Category Mode */}
                  {editingCategory && editingCategory.id === category.id ? (
                    <form onSubmit={handleEditCategory} className="space-y-3">
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                      <input
                        type="url"
                        value={editingCategory.imageUrl}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, imageUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                      <div className="flex space-x-2">
                        <button type="submit" className="btn-primary">Save</button>
                        <button type="button" className="btn-secondary" onClick={() => setEditingCategory(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        {category.imageUrl && <img src={category.imageUrl} alt={category.name} className="w-12 h-12 object-cover rounded" />}
                        <h4 className="text-lg font-medium">{category.name}</h4>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 text-sm" onClick={() => setEditingCategory(category)}>Edit</button>
                        <button className="text-red-600 text-sm" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                      </div>
                    </div>
                  )}

                  {/* Subcategories */}
                  <div className="pl-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h5>
                    {category.subcategories.length > 0 ? (
                      <ul className="space-y-2">
                        {category.subcategories.map(sub => (
                          <li key={sub.id} className="flex justify-between items-center">
                            {/* ✅ Edit Subcategory Mode */}
                            {editingSubcategory && editingSubcategory.id === sub.id ? (
                              <form onSubmit={handleEditSubcategory} className="flex items-center space-x-2 w-full">
                                <input
                                  type="text"
                                  value={editingSubcategory.name}
                                  onChange={(e) =>
                                    setEditingSubcategory({ ...editingSubcategory, name: e.target.value })
                                  }
                                  className="px-2 py-1 border rounded-md flex-1"
                                  required
                                />
                                <input
                                  type="url"
                                  value={editingSubcategory.imageUrl}
                                  onChange={(e) =>
                                    setEditingSubcategory({ ...editingSubcategory, imageUrl: e.target.value })
                                  }
                                  className="px-2 py-1 border rounded-md flex-1"
                                />
                                <div className="flex space-x-2">
                                  <button type="submit" className="btn-primary">Save</button>
                                  <button type="button" className="btn-secondary" onClick={() => setEditingSubcategory(null)}>Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <>
                                <div className="flex items-center space-x-2">
                                  {sub.imageUrl && <img src={sub.imageUrl} alt={sub.name} className="w-8 h-8 object-cover rounded" />}
                                  <span>{sub.name}</span>
                                </div>
                                <div className="flex space-x-2">
                                  <button className="text-indigo-600 text-sm" onClick={() => setEditingSubcategory({ ...sub, categoryId: category.id })}>Edit</button>
                                  <button className="text-red-600 text-sm" onClick={() => handleDeleteSubcategory(category.id, sub.id)}>Delete</button>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No subcategories yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
