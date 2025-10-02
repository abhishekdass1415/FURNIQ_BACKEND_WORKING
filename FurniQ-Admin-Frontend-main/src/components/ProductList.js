'use client'

import Link from 'next/link';

/**
 * A reusable component to display a list of products in a table.
 * It receives all data and functions as props.
 */
export default function ProductList({ products, viewMode, handleRestore }) {

  // Helper function to get a readable stock status
  const getStockStatus = (stock, lowStockThreshold = 10) => {
    if (stock > lowStockThreshold) return { text: 'In Stock', className: 'bg-green-100 text-green-800' };
    if (stock > 0) return { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
  };

  // Helper function to format price
  const formatPrice = (price) => {
    if (!price) return "N/A";
    const numeric = parseInt(price.toString().replace(/[^0-9]/g, '')) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0
    }).format(numeric);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map(p => {
            const stockStatus = getStockStatus(p.stock, p.lowStock);
            return (
              <tr key={p.id} className="hover:bg-gray-50">
                {/* Product */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <img
                      className="h-12 w-12 rounded-md object-cover"
                      src={p.imageUrl || 'https://via.placeholder.com/48'}
                      alt={p.name}
                    />
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </div>
                </td>
                {/* SKU */}
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{p.sku}</td>
                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(p.price)}</td>
                {/* Stock */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.className}`}>
                    {p.stock} units ({stockStatus.text})
                  </span>
                </td>
                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {viewMode === 'active' ? (
                    <Link href={`/products/${p.id}`} className="btn-secondary-sm">View</Link>
                  ) : (
                    <button onClick={() => handleRestore(p.id)} className="btn-primary-sm">Restore</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}