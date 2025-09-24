"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProducts } from "@/context/ProductContext";

export default function Dashboard() {
  const { products, loading, error, getStockStatus } = useProducts();

  // ✅ helper for INR formatting
  const formatPrice = (price) => {
    if (!price) return "₹0";
    const numeric = parseInt(price.toString().replace(/\D/g, "")) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  return (
    <div className="md:ml-64 pt-16">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

        <div className="mt-8 grid grid-cols-1 gap-6">
          {/* 🔹 Product Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Current Products</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <p className="text-red-600 mb-3">⚠ {error}</p>
              )}
              {loading ? (
                <p className="text-gray-600">Loading products...</p>
              ) : products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Image</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">SKU</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Category</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Price</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Stock</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td className="px-6 py-4">
                            {p.imageUrl ? (
                              <image
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-12 h-12 rounded"
                              />
                            ) : (
                              <span className="text-gray-400">No Image</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                          <td className="px-6 py-4">{p.sku}</td>
                          <td className="px-6 py-4">{p.category}</td>
                          <td className="px-6 py-4">{formatPrice(p.price)}</td>
                          <td className="px-6 py-4">{p.stock}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                getStockStatus(p.stock) === "In Stock"
                                  ? "bg-green-100 text-green-800"
                                  : getStockStatus(p.stock) === "Low Stock"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {getStockStatus(p.stock)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No products available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
