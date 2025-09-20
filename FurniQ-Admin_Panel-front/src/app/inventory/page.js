"use client";
import { useState, useEffect } from "react";
import { useInventory } from "@/context/Inventorycontext";
import { useProducts } from "@/context/ProductContext";

// A reusable date formatting component that only runs on the client
function ClientDate({ date }) {
  if (!date) return "-";
  const d = new Date(date);
  return <>{d.toLocaleString("en-US", { hour12: true })}</>;
}

export default function InventoryLogs() {
  const { inventoryLogs, loading, error, createInventoryLog, fetchInventoryLogs } = useInventory();
  const { products } = useProducts();

  const [form, setForm] = useState({
    productId: "",
    change: "",
    reason: "",
    notes: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddLog = async () => {
    if (!form.productId || !form.change || !form.reason) return;

    setIsSubmitting(true);
    try {
      const logData = {
        productId: form.productId,
        change: parseInt(form.change, 10),
        reason: form.reason,
        notes: form.notes || ''
      };

      await createInventoryLog(logData);
      
      // Reset form
      setForm({ productId: "", change: "", reason: "", notes: "" });
      setEditingId(null);
    } catch (error) {
      console.error('Error creating inventory log:', error);
      alert('Failed to create inventory log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (log) => {
    setForm({
      productId: log.productId,
      change: log.change,
      reason: log.reason,
      notes: log.notes || '',
    });
    setEditingId(log.id);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this log?"
    );
    if (confirmDelete) {
      // For now, we'll just log the action
      // In a real app, you'd make an API call to delete
      console.log('Delete inventory log:', id);
    }
  };

  return (
    <div className="md:ml-64 pt-16">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Inventory Logs
        </h2>

        {/* Add / Edit Log Form */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Log" : "Add New Log"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="border rounded p-2"
              required
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (SKU: {product.sku})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Change (+/-)"
              value={form.change}
              onChange={(e) => setForm({ ...form, change: e.target.value })}
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              placeholder="Reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border rounded p-2"
            />
          </div>
          <button
            onClick={handleAddLog}
            disabled={isSubmitting}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : (editingId ? "Update Log" : "Add Log")}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm({
                  productId: "",
                  change: "",
                  reason: "",
                  notes: "",
                  userId: "",
                });
              }}
              className="mt-4 ml-2 px-4 py-2 bg-gray-400 text-white rounded-lg"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Inventory Logs</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading inventory logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Product</th>
                  <th className="border px-3 py-2 text-left">Change</th>
                  <th className="border px-3 py-2 text-left">Reason</th>
                  <th className="border px-3 py-2 text-left">Notes</th>
                  <th className="border px-3 py-2 text-left">Date</th>
                  <th className="border px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="border px-3 py-2 text-center text-gray-500">
                      No inventory logs found
                    </td>
                  </tr>
                ) : (
                  inventoryLogs.map((log) => {
                    const product = products.find(p => p.id === log.productId);
                    return (
                      <tr key={log.id}>
                        <td className="border px-3 py-2">
                          {product ? `${product.name} (${product.sku})` : log.productId}
                        </td>
                        <td className={`border px-3 py-2 ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.change > 0 ? '+' : ''}{log.change}
                        </td>
                        <td className="border px-3 py-2">{log.reason}</td>
                        <td className="border px-3 py-2">{log.notes || '-'}</td>
                        <td className="border px-3 py-2">
                          <ClientDate date={log.createdAt} />
                        </td>
                        <td className="border px-3 py-2">
                          <button
                            onClick={() => handleEdit(log)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
