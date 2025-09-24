'use client'

import { useState, useEffect } from 'react'

export default function CategoryManagement() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddSubcategory, setShowAddSubcategory] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newCategory, setNewCategory] = useState({ name: '' })
  const [newSubcategory, setNewSubcategory] = useState({ name: '', imageUrl: '' })
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingSubcategory, setEditingSubcategory] = useState(null)


  
  // Fetch categories from backend API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`)
        if (response.ok) {
          const data = await response.json()
          
          // Filter main categories (those without parentId) and group their subcategories
          const mainCategories = data.filter(category => !category.parentId)
          const categoriesWithSubcategories = mainCategories.map(category => ({
            ...category,
            subcategories: data.filter(sub => sub.parentId === category.id)
          }))
          
          setCategories(categoriesWithSubcategories)
        } else {
          console.error('Failed to fetch categories')
          setCategories([])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // ✅ Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name
        })
      })
      
      if (response.ok) {
        const newCategoryData = await response.json()
        // Ensure new category has subcategories array
        const categoryWithSubcategories = {
          ...newCategoryData,
          subcategories: []
        }
        setCategories([...categories, categoryWithSubcategories])
        setNewCategory({ name: '' })
        setShowAddCategory(false)
      } else {
        console.error('Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  // ✅ Add Subcategory
  const handleAddSubcategory = async (e) => {
    e.preventDefault()
    if (!selectedCategory) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSubcategory.name,
          parentId: selectedCategory,
          imageUrl: newSubcategory.imageUrl || ''
        })
      })
      
      if (response.ok) {
        const newSubcategoryData = await response.json()
        // Refresh categories to get the updated list with subcategories
        const fetchCategories = async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`)
            if (response.ok) {
              const data = await response.json()
              // Filter main categories (those without parentId) and group their subcategories
              const mainCategories = data.filter(category => !category.parentId)
              const categoriesWithSubcategories = mainCategories.map(category => ({
                ...category,
                subcategories: data.filter(sub => sub.parentId === category.id)
              }))
              setCategories(categoriesWithSubcategories)
            }
          } catch (error) {
            console.error('Error fetching categories:', error)
          }
        }
        await fetchCategories()
        setNewSubcategory({ name: '', imageUrl: '' })
        setShowAddSubcategory(false)
      } else {
        console.error('Failed to add subcategory')
      }
    } catch (error) {
      console.error('Error adding subcategory:', error)
    }
  }

  // ✅ Edit Category
  const handleEditCategory = (e) => {
    e.preventDefault()
    const updatedCategories = categories.map(category => {
      if (category.id === editingCategory.id) {
        return {
          ...category,
          name: editingCategory.name,
        }
      }
      return category
    })
    setCategories(updatedCategories)
    setEditingCategory(null)
  }

  // ✅ Edit Subcategory
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

  // ✅ Delete Category
  const handleDeleteCategory = (id) => {
    if (window.confirm('Delete this category and all its subcategories?')) {
      setCategories(categories.filter(category => category.id !== id))
    }
  }

  // ✅ Delete Subcategory
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
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading categories...</p>
              </div>
            ) : (
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
                      
                      <div className="flex space-x-2">
                        <button type="submit" className="btn-primary">Save</button>
                        <button type="button" className="btn-secondary" onClick={() => setEditingCategory(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        {category.imageUrl && <image src={category.imageUrl} alt={category.name} className="w-12 h-12 object-cover rounded" />}
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
                    {category.subcategories && category.subcategories.length > 0 ? (
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
                                  {sub.imageUrl && <image src={sub.imageUrl} alt={sub.name} className="w-8 h-8 object-cover rounded" />}
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
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
