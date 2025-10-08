'use client'

import { useState, useEffect } from 'react'
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, ArchiveBoxIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  // State for data fetched from the API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local UI state
  const [activeView, setActiveView] = useState('summary'); // 'summary', 'allProducts', 'lowStock'
  const [publishedFilter, setPublishedFilter] = useState('live'); // 'live' or 'draft'

  // Base URL for API calls, works on localhost and Vercel
  const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch products and categories at the same time for efficiency
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(new URL('/api/products', API_BASE_URL)),
        fetch(new URL('/api/categories', API_BASE_URL))
      ]);

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch dashboard data. Please try again.');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, [API_BASE_URL]);


  // --- DATA MANIPULATION ---
  const handleTogglePublishedStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'live' ? 'draft' : 'live';
    try {
      const res = await fetch(new URL(`/api/products/${productId}`, API_BASE_URL), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedStatus: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update product status.');

      // Refresh all data to ensure the dashboard is in sync
      await fetchData();

    } catch (err) {
      alert(err.message); // Simple error feedback for the user
    }
  };

  // --- DERIVED DATA (Calculations from fetched state) ---
  const activeProducts = products.filter(p => !p.isDeleted);
  const lowStockProducts = activeProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10));
  const liveProducts = activeProducts.filter(p => p.publishedStatus === 'live');
  const draftProducts = activeProducts.filter(p => p.publishedStatus === 'draft');

  // --- RENDER LOGIC ---
  if (loading) return <div className="text-center p-8">Loading Dashboard...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  // Reusable component for displaying lists of products
  const ProductListByCategory = ({ title, productList }) => (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveView('summary')} className="btn-secondary p-2 h-10 w-10 flex items-center justify-center">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{title} ({productList.length})</h2>
      </div>
      <div className="space-y-6">
        {categories.map(category => {
          const productsInCategory = productList.filter(p => p.categoryId === category.id);
          if (productsInCategory.length === 0) return null;

          return (
            <div key={category.id}>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{category.name}</h3>
              <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                {productsInCategory.map(product => (
                  <div key={product.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={product.imageUrl || 'https://placehold.co/64x64/E0E7FF/4F46E5?text=Img'} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500 font-mono">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <a href={`/products/${product.id}`} className="btn-secondary-sm">View</a>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {productList.length === 0 && <p className="text-center text-gray-500 py-6">No products to display in this category.</p>}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {activeView === 'summary' && (
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      )}

      {activeView === 'summary' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setActiveView('allProducts')} className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between text-left hover:shadow-lg transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Active Products</p>
                <p className="text-3xl font-bold text-gray-800">{activeProducts.length}</p>
              </div>
              <ArchiveBoxIcon className="w-10 h-10 text-indigo-500" />
            </button>
            <button onClick={() => setActiveView('lowStock')} className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between text-left hover:shadow-lg transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                <p className="text-3xl font-bold text-yellow-500">{lowStockProducts.length}</p>
              </div>
              <ExclamationTriangleIcon className="w-10 h-10 text-yellow-500" />
            </button>
          </div>

          {/* Live/Draft Product Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Website Product Status</h3>
              <div className="mt-2 flex gap-2 border-b border-gray-200">
                <button onClick={() => setPublishedFilter('live')} className={`py-2 px-4 text-sm font-medium ${publishedFilter === 'live' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Live ({liveProducts.length})
                </button>
                <button onClick={() => setPublishedFilter('draft')} className={`py-2 px-4 text-sm font-medium ${publishedFilter === 'draft' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Draft ({draftProducts.length})
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {(publishedFilter === 'live' ? liveProducts : draftProducts).map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <img src={p.imageUrl || 'https://placehold.co/48x48/E0E7FF/4F46E5?text=Img'} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        <button onClick={() => handleTogglePublishedStatus(p.id, p.publishedStatus)}
                          className={`btn-secondary-sm flex items-center gap-1.5 ${p.publishedStatus === 'live' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                        >
                          {p.publishedStatus === 'live' ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                          {p.publishedStatus === 'live' ? 'Make Draft' : 'Go Live'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(publishedFilter === 'live' ? liveProducts : draftProducts).length === 0 && (
                <p className="text-center text-gray-500 py-6">No {publishedFilter} products.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conditional rendering for detailed views */}
      {activeView === 'allProducts' && (
        <ProductListByCategory title="All Active Products" productList={activeProducts} />
      )}
      {activeView === 'lowStock' && (
        <ProductListByCategory title="Low Stock Items" productList={lowStockProducts} />
      )}
    </div>
  )
}
