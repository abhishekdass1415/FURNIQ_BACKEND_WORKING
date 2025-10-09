'use client'

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCategories } from '@/context/CategoryContext';
import { useUsers } from '@/context/UserContext';
import { useInventory } from '@/context/Inventorycontext';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  TagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// A loading skeleton component for a better initial load experience
function DashboardSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-9 w-64 bg-gray-200 rounded-md mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md h-28"></div>
        <div className="bg-white p-6 rounded-lg shadow-md h-28"></div>
        <div className="bg-white p-6 rounded-lg shadow-md h-28"></div>
        <div className="bg-white p-6 rounded-lg shadow-md h-28"></div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="h-6 w-48 bg-gray-200 rounded-md mb-4"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { products, updateProduct } = useProducts();
  const { categories } = useCategories();
  const { users } = useUsers();
  const { logs } = useInventory();

  const [activeView, setActiveView] = useState('summary');

  // Derived data calculations
  const activeProducts = products.filter(p => p.status === 'active');
  const lowStockProducts = activeProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10));
  const liveProducts = activeProducts.filter(p => p.publishedStatus === 'live');
  const draftProducts = activeProducts.filter(p => p.publishedStatus === 'draft');

  const handleTogglePublishedStatus = (productId, currentStatus) => {
    const newStatus = currentStatus === 'live' ? 'draft' : 'live';
    updateProduct(productId, { publishedStatus: newStatus });
  };

  // Show skeleton while data is loading
  if (!products.length && !categories.length) {
    return <DashboardSkeleton />;
  }

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
          const productsInCategory = productList.filter(p => p.category === category.name);
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
                    <Link href={`/products/${product.id}`} className="btn-secondary-sm">View</Link>
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

