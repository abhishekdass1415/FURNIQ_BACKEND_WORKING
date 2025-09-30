'use client'

import { useProducts } from '@/context/ProductContext'
import Link from 'next/link'
import { ArrowUpRightIcon, ArchiveBoxIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { products, loading } = useProducts();

  if (loading) return <div className="text-center p-6">Loading dashboard...</div>;

  const activeProducts = products.filter(p => p.status === 'active');
  const lowStockProducts = activeProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStock || 10));

  const recentProducts = [...activeProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const formatPrice = (price) => {
    if (!price) return "N/A";
    const numeric = parseInt(price.toString().replace(/\D/g, '')) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0
    }).format(numeric);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Active Products</p>
            <p className="text-3xl font-bold text-gray-800">{activeProducts.length}</p>
          </div>
          <ArchiveBoxIcon className="w-10 h-10 text-indigo-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
            <p className="text-3xl font-bold text-yellow-500">{lowStockProducts.length}</p>
          </div>
          <ExclamationTriangleIcon className="w-10 h-10 text-yellow-500" />
        </div>
      </div>

      {/* --- RECENTLY ADDED PRODUCTS TABLE --- */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Recently Added Products</h3>
            <Link href="/products" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                View All <ArrowUpRightIcon className="w-4 h-4" />
            </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Product</th>
                <th className="th-style">SKU</th>
                <th className="th-style">Price</th>
                <th className="th-style text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProducts.map(p => (
                <tr key={p.id} className="align-middle hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <img className="h-12 w-12 rounded-md object-cover" src={p.imageUrl || 'https://via.placeholder.com/48'} alt={p.name} />
                        <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">{p.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/products/${p.id}`} className="btn-secondary-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentProducts.length === 0 && (
            <p className="text-center py-8 text-gray-500">No recent products to display.</p>
          )}
        </div>
      </div>
    </div>
  )
}
