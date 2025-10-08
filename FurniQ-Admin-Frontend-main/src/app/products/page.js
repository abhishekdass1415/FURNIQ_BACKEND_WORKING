'use client'

import { useState, useEffect } from 'react';

// --- Reusable Icon Components ---
// These are defined once at the top for clarity.
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RestoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
  </svg>
);

// --- Reusable Table Row Component ---
// This component keeps the table structure clean and readable.
const ProductRow = ({ product, onView, onAction, actionText, actionIcon }) => (
  <tr className="align-middle hover:bg-gray-50">
    <td className="px-6 py-4">
      <div className="flex items-center gap-4">
        <img
          className="h-12 w-12 rounded-md object-cover"
          src={product.imageUrl || 'https://placehold.co/48x48/E0E7FF/4F46E5?text=Img'}
          alt={product.name}
        />
        <span className="font-medium text-gray-900">{product.name}</span>
      </div>
    </td>
    <td className="px-6 py-4 font-mono text-sm text-gray-500">{product.sku}</td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      {onView ? (
        <a href={onView} className="btn-secondary-sm">View</a>
      ) : (
        <button onClick={onAction} className="btn-primary-sm flex items-center gap-1">
          {actionIcon} {actionText}
        </button>
      )}
    </td>
  </tr>
);

// --- Main Page Component ---
// All the conflicting code has been removed, leaving one clean, functional component.
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state for filters
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'
  const [publishedFilter, setPublishedFilter] = useState('live'); // 'live' or 'draft'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

  // --- Data Fetching and Updating ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(new URL('/api/products', API_BASE_URL)),
        fetch(new URL('/api/categories', API_BASE_URL)),
      ]);
      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch initial data.');
      }
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData);
      setCategories(categoriesData.filter(c => !c.parentId)); // Only top-level categories for filtering
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_BASE_URL]);

  const handleProductUpdate = async (productId, updateData) => {
    try {
      const res = await fetch(new URL(`/api/products/${productId}`, API_BASE_URL), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update product status.');
      // Re-fetch data to reflect changes everywhere, ensuring UI is in sync.
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to update product. Please try again.');
    }
  };

  // --- Filtering Logic ---
  const filteredSubcategories = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)?.subcategories || []
    : [];

  const getFilteredProducts = () => {
    return products.filter(p => {
      // Filter by Active vs. Archived
      const isInView = viewMode === 'archived' ? p.isDeleted : !p.isDeleted;
      if (!isInView) return false;

      // Filter by Live vs. Draft (only in active view)
      if (viewMode === 'active' && p.publishedStatus !== publishedFilter) {
        return false;
      }

      // Filter by selected category (top-level)
      if (selectedCategory && p.categoryId !== selectedCategory) return false;
      
      // Note: Subcategory filtering would require more complex logic if your API supports it.
      // This basic implementation filters by top-level category.

      return true;
    });
  };

  const filteredProducts = getFilteredProducts();

  // --- Render Logic ---
  if (loading) return <div className="text-center p-8">Loading products...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <a href="/products/add" className="btn-primary">Add New Product</a>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Filter Products</h3>
            <button onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); }} className="text-sm text-indigo-600 hover:underline">Clear Filters</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }} className="input-style !mt-0">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)} disabled={true} className="input-style !mt-0 disabled:bg-gray-100">
            <option value="">All Subcategories (Not Implemented)</option>
            {/* {filteredSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)} */}
          </select>
        </div>
      </div>
      
      {/* Tabs for Active/Archived */}
      <div className="flex border-b">
        <button onClick={() => setViewMode('active')} className={`py-2 px-4 text-sm font-medium ${viewMode === 'active' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Active Products</button>
        <button onClick={() => setViewMode('archived')} className={`py-2 px-4 text-sm font-medium ${viewMode === 'archived' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Archived</button>
      </div>

      {/* Sub-tabs for Live/Draft */}
      {viewMode === 'active' && (
        <div className="bg-white pt-2 px-2 flex gap-2">
          <button onClick={() => setPublishedFilter('live')} className={`px-3 py-1 text-sm rounded-md ${publishedFilter === 'live' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>Live on Site</button>
          <button onClick={() => setPublishedFilter('draft')} className={`px-3 py-1 text-sm rounded-md ${publishedFilter === 'draft' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>Drafts</button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Product</th>
                <th className="th-style">SKU</th>
                <th className="th-style text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(p => {
                let actionProps = {};
                if (viewMode === 'active') {
                  if (publishedFilter === 'live') {
                    actionProps = { onView: `/products/${p.id}` };
                  } else { // Draft
                    actionProps = { onAction: () => handleProductUpdate(p.id, { publishedStatus: 'live' }), actionText: 'Go Live', actionIcon: <EyeIcon /> };
                  }
                } else { // Archived
                  actionProps = { onAction: () => handleProductUpdate(p.id, { isDeleted: false, deletedAt: null }), actionText: 'Restore', actionIcon: <RestoreIcon /> };
                }
                return <ProductRow key={p.id} product={p} {...actionProps} />;
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <p className="text-center py-8 text-gray-500">No products found in this view.</p>
          )}
        </div>
      </div>
    </div>
  )
}

