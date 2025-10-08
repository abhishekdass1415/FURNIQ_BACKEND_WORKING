'use client'

import React, { useState, useEffect } from "react";

// A reusable date formatting component
function ClientDate({ date }) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// A simple modal component for confirmations, included in the same file.
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="text-sm text-gray-600 mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function InventoryLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ productId: "", change: "", reason: "", notes: "", userId: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const API_BASE_URL = window.location.origin;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(new URL('/api/inventory-logs', API_BASE_URL));
      if (!res.ok) throw new Error('Failed to fetch inventory logs.');
      const data = await res.json();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.change || !form.reason) return;

    const logData = { ...form, change: parseInt(form.change, 10) };
    const url = editingId
      ? new URL(`/api/inventory-logs/${editingId}`, API_BASE_URL)
      : new URL('/api/inventory-logs', API_BASE_URL);

    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${editingId ? 'update' : 'create'} log.`);
      }
      await fetchLogs(); // Refresh data from server
      cancelEdit();
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    }
  };

  const handleEdit = (log) => {
    setForm({
      productId: log.productId,
      change: log.change.toString(),
      reason: log.reason,
      notes: log.notes || "",
      userId: log.userId || "",
    });
    setEditingId(log.id);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(new URL(`/api/inventory-logs/${deleteTargetId}`, API_BASE_URL), { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete log.');

      setLogs(logs.filter(log => log.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ productId: "", change: "", reason: "", notes: "", userId: "" });
  };

  if (loading) return <div className="text-center p-10">Loading inventory logs...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full">
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
      >
        Are you sure you want to delete this log? This action cannot be undone.
      </ConfirmationModal>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Logs</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Log" : "Add New Log"}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" placeholder="Product ID / SKU *" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="input-style" required />
          <input type="number" placeholder="Change (+/-) *" value={form.change} onChange={(e) => setForm({ ...form, change: e.target.value })} className="input-style" required />
          <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input-style" required>
            <option value="">Select Reason *</option>
            <option>Stock Added</option>
            <option>Order Shipped</option>
            <option>Return</option>
            <option>Correction</option>
            <option>Initial Stock</option>
          </select>
          <input type="text" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-style" />
          <input type="text" placeholder="User ID" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="input-style" />
          <div className="flex items-center space-x-3 lg:col-start-3">
            <button type="submit" className="btn-primary w-full">
              {editingId ? "Update Log" : "Add Log"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn-secondary w-full">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">History ({logs.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-indigo-600">{log.productId}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-center font-semibold ${log.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {log.change > 0 ? `+${log.change}` : log.change}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{log.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{log.notes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{log.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500"><ClientDate date={log.createdAt} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => handleEdit(log)} className="text-indigo-600 hover:text-indigo-900 mr-4 text-sm font-medium">Edit</button>
                    <button onClick={() => setDeleteTargetId(log.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 bg-gray-50">
                    No logs available.
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
