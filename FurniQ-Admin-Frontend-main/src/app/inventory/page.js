'use client'

import { useState, useEffect } from "react";
import { useInventory } from "@/context/InventoryContext";

// Reusable date formatting component
function ClientDate({ date }) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function InventoryLogs() {
  const { logs, setLogs } = useInventory(); // use context state
  const [form, setForm] = useState({ productId: "", change: "", reason: "", notes: "", userId: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch logs from backend
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/logs`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data); // update context
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [setLogs]);

  // Add / Update log
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.change || !form.reason) return;

    const logData = { ...form, change: parseInt(form.change, 10) };

    try {
      let res, data;
      if (editingId) {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/logs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logData),
        });
        if (!res.ok) throw new Error("Failed to update log");
        data = await res.json();
        setLogs(logs.map(log => (log.id === editingId ? data : log)));
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logData),
        });
        if (!res.ok) throw new Error("Failed to add log");
        data = await res.json();
        setLogs([data, ...logs]);
      }
      setForm({ productId: "", change: "", reason: "", notes: "", userId: "" });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleEdit = (log) => {
    setForm({
      productId: log.productId,
      change: log.change,
      reason: log.reason,
      notes: log.notes,
      userId: log.userId,
    });
    setEditingId(log.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/logs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete log");
      setLogs(logs.filter(log => log.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ productId: "", change: "", reason: "", notes: "", userId: "" });
  };

  if (loading) return <p>Loading inventory logs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Logs</h1>

      {/* Add / Edit Log Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Log" : "Add New Log"}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Product ID / SKU *"
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            className="input-style"
            required
          />
          <input
            type="number"
            placeholder="Change (+/-) *"
            value={form.change}
            onChange={(e) => setForm({ ...form, change: e.target.value })}
            className="input-style"
            required
          />
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="input-style"
            required
          >
            <option value="">Select Reason *</option>
            <option>Stock Added</option>
            <option>Order Shipped</option>
            <option>Return</option>
            <option>Correction</option>
            <option>Initial Stock</option>
          </select>
          <input
            type="text"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input-style"
          />
          <input
            type="text"
            placeholder="User ID"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
            className="input-style"
          />
          <div className="flex items-center space-x-3 lg:col-start-3">
            <button type="submit" className="btn-primary w-full">{editingId ? "Update Log" : "Add Log"}</button>
            {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary w-full">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Logs Table */}
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
              {logs.length > 0 ? logs.map((log) => (
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
                    <button onClick={() => handleDelete(log.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 bg-gray-50">No logs available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
