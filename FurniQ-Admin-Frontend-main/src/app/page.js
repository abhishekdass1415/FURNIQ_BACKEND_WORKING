'use client'

import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCategories } from '@/context/CategoryContext';
import { useUsers } from '@/context/UserContext';
import { useInventory } from '@/context/InventoryContext';
import Link from 'next/link';
import {
  ArrowUpRightIcon,
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
      {/* Skeleton for Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md h-28"></div>
        <div className="bg-white p-6 rounded-lg shadow-md h-28"></div>
        <div className="bg-white p-6 rounded-lg shadow-md h-28"></div>
        <div className="bg-white p-6 rounded-lg shadow-md h-28"></div>
      </div>
      {/* Skeleton for Table */}
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
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { users, loading: usersLoading } = useUsers();
  const { logs, loading: inventoryLoading } = useInventory();

  // Show skeleton if any of the data is still loading
  const isLoading = productsLoading || categoriesLoading || usersLoading || inventoryLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // --- Calculate Stats ---
  const activeProducts = products.filter(p => p.status === 'active');
  const lowStockProducts = activeProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStock || 10));
  const recentProducts = [...activeProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // --- Helper Functions ---
  const formatPrice = (price) => {
    if (!price) return "N/A";
    const numeric = parseInt(price.toString().replace(/\D/g, '')) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0
    }).format(numeric);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || 'Admin'}!</h1>
        <p className="text-gray-500">Here's a summary of your store's activity.</p>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Products</p>
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
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Categories</p>
            <p className="text-3xl font-bold text-gray-800">{categories.length}</p>
          </div>
          <TagIcon className="w-10 h-10 text-green-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-3xl font-bold text-gray-800">{users.length}</p>
          </div>
          <UsersIcon className="w-10 h-10 text-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- RECENTLY ADDED PRODUCTS --- */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Recently Added Products</h3>
            <Link href="/products" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProducts.length > 0 ? recentProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-4">
                        <img src={p.imageUrl || 'https://via.placeholder.com/48'} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                          <p className="font-mono text-xs text-gray-500">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/products/${p.id}`} className="btn-secondary-sm">View</Link>
                    </td>
                  </tr>
                )) : (
                  <tr><td className="text-center py-8 text-gray-500">No recent products.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- RECENT INVENTORY LOGS --- */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Inventory Changes</h3>
            <Link href="/inventory" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLogs.length > 0 ? recentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-mono text-sm text-indigo-600">{log.productId}</p>
                      <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">{log.reason}</td>
                    <td className={`px-6 py-3 text-right font-semibold text-sm ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {log.change > 0 ? `+${log.change}` : log.change}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="text-center py-8 text-gray-500">No recent inventory changes.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
