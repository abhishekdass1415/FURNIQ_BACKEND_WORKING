'use client'

import { useProducts } from '@/context/ProductContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProductSidebar() {
  const { products, loading } = useProducts(); // Get loading state from the context
  const pathname = usePathname();

  const activeProducts = products.filter(product => product.status === 'active');

  // Show a skeleton loader while products are being fetched
  if (loading) {
    return (
      <aside className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">All Products</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center text-center p-3 rounded-md bg-gray-200 animate-pulse">
              <div className="w-20 h-20 bg-gray-300 rounded-md"></div>
              <div className="mt-2 h-4 w-24 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">All Products</h3>
      <nav>
        <ul className="space-y-2">
          {activeProducts.map(product => {
            const href = `/products/${product.id}`;
            const isActive = pathname === href;

            return (
              <li key={product.id}>
                <Link
                  href={href}
                  className={`flex flex-col items-center text-center p-3 rounded-md transition-colors ${isActive
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/80'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-md flex-shrink-0 shadow-sm"
                  />
                  <span className="mt-2 text-sm">
                    {product.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}