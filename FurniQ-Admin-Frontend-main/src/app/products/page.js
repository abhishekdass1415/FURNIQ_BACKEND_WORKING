'use client'

import { useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import { useCategories } from '@/context/CategoryContext';
import Link from 'next/link';
import ProductList from '@/components/ProductList'; // We import the table component

// A simple loading spinner to show while data is being fetched
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, loading: productsLoading, updateProduct } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [viewMode, setViewMode] = useState('active');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  // Determine which subcategories to show based on the selected category
  const filteredSubcategories = selectedCategory
    ? categories.find(cat => cat.name === selectedCategory)?.subcategories || []
    : [];

  // Filter products based on the "Active" or "Archived" tab
  const listSource = products.filter(p => p.status === viewMode);

  // Further filter products based on the selected category/subcategory dropdowns
  const filteredProducts = listSource.filter(product => {
    // These category/subcategory names come from your Product model in Prisma
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedSubcategory && product.subcategory !== selectedSubcategory) return false;
    return true;
  });

  // Function to restore an archived product
  const handleRestore = (productId) => {
    updateProduct(productId, { status: 'active' });
  };

  // Show the spinner if either products or categories are still loading
  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <Link href="/products/add" className="btn-primary">Add New Product</Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Filter Products</h3>
          <button
            onClick={() => { setSelectedCategory(''); setSelectedSubcategory('') }}
            className="text-sm text-indigo-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('') }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="subcategory-select" className="block text-sm font-medium text-gray-700">Subcategory</label>
            <select
              id="subcategory-select"
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={!selectedCategory}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">All Subcategories</option>
              {filteredSubcategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs for Active/Archived */}
      <div className="mb-4 flex border-b">
        <button
          onClick={() => setViewMode('active')}
          className={`py-2 px-4 text-sm font-medium ${viewMode === 'active' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Active ({products.filter(p => p.status === 'active').length})
        </button>
        <button
          onClick={() => setViewMode('archived')}
          className={`py-2 px-4 text-sm font-medium ${viewMode === 'archived' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Archived ({products.filter(p => p.status === 'archived').length})
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? <LoadingSpinner /> : (
          // We use the separate ProductList component here for a cleaner structure
          <ProductList
            products={filteredProducts}
            viewMode={viewMode}
            handleRestore={handleRestore}
          />
        )}

        {/* Show this message if there are no products after loading is complete */}
        {!isLoading && filteredProducts.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            No {viewMode} products found matching the criteria.
          </p>
        )}
      </div>
    </div>
  )
}