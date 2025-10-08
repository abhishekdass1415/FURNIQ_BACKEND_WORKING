'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// This is now a dynamic, reusable component that fetches its own data.
export default function ProductList() {
  // State to hold data from the API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base URL for API calls that works on both localhost and Vercel
  const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

  // --- DATA FETCHING ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(new URL('/api/products', API_BASE_URL));
      if (!res.ok) {
        throw new Error('Failed to fetch products. Please try again later.');
      }
      const data = await res.json();
      // We only want to show non-deleted products in this list
      setProducts(data.filter(p => !p.isDeleted));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect runs once when the component mounts to fetch the initial data
  useEffect(() => {
    fetchProducts();
  }, [API_BASE_URL]); // Dependency ensures it has the base URL before running

  // --- DATA MANIPULATION ---
  const handleDelete = async (productId) => {
    // Confirm with the user before deleting, as it's a destructive action
    if (!window.confirm('Are you sure you want to delete this product? This is a soft delete.')) {
      return;
    }

    try {
      const res = await fetch(new URL(`/api/products/${productId}`, API_BASE_URL), {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete product.');
      }

      // For a fast UI update, we can remove the product from the local state
      // without needing to re-fetch the entire list from the server.
      setProducts(products.filter((product) => product.id !== productId));

    } catch (err) {
      alert(err.message); // Simple feedback for the user
    }
  };

  // --- HELPER FUNCTIONS ---
  // A robust function to format prices, assuming the API returns numbers
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // A function to determine the stock status dynamically
  const getStatus = (product) => {
    if (product.stock === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    }
    if (product.stock <= (product.lowStockThreshold || 10)) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  };


  // --- RENDER LOGIC ---
  if (loading) {
    return <div className="text-center p-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Product</th>
                <th className="th-style">Category</th>
                <th className="th-style">Price</th>
                <th className="th-style">Stock</th>
                <th className="th-style">Status</th>
                <th className="th-style text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? products.map((product) => {
                const status = getStatus(product);
                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      {/* Using <a> tag for navigation is robust and works everywhere */}
                      <a href={`/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </a>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
