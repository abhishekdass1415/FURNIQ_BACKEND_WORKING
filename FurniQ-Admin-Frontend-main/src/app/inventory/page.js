'use client'

import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";

function ClientDate({ date }) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' });
}

export default function InventoryLogs() {
  const { logs, loading, addLog, updateLog, deleteLog } = useInventory(); 
  
  const [form, setForm] = useState({ productId: "", change: "", reason: "", notes: "", userId: "" });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.change || !form.reason) return;

    const logData = { ...form, change: parseInt(form.change, 10) };

    if (editingId) {
      await updateLog(editingId, logData);
    } else {
      await addLog(logData);
    }
    setForm({ productId: "", change: "", reason: "", notes: "", userId: "" });
    setEditingId(null);
  };

  const handleEdit = (log) => {
    setForm({ productId: log.productId, change: log.change, reason: log.reason, notes: log.notes, userId: log.userId });
    setEditingId(log.id);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      await deleteLog(id);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ productId: "", change: "", reason: "", notes: "", userId: "" });
  };

  if (loading) {
    return <div className="p-10 text-center">Loading inventory history...</div>;
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Logs</h1>

      {/* Add / Edit Log Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Log" : "Add New Log"}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" placeholder="Product ID / SKU *" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="input-style" required />
          <input type="number" placeholder="Change (+/-) *" value={form.change} onChange={(e) => setForm({ ...form, change: e.target.value })} className="input-style" required />
          <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input-style" required>
            <option value="">Select Reason *</option>
            <option>Initial Stock</option>
            <option>Stock Added</option>
            <option>Order Shipped</option>
            <option>Return</option>
            <option>Correction</option>
          </select>
          <input type="text" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-style" />
          <input type="text" placeholder="User ID" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="input-style" />
          <div className="flex items-center space-x-3 lg:col-start-3">
            <button type="submit" className="btn-primary w-full">{editingId ? "Update Log" : "Add Log"}</button>
            {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary w-full">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b"><h3 className="text-lg font-medium">History ({logs.length})</h3></div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Product ID</th>
                <th className="th-style text-center">Change</th>
                <th className="th-style">Reason</th>
                <th className="th-style">Notes</th>
                <th className="th-style">User ID</th>
                <th className="th-style">Date</th>
                <th className="th-style">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="td-style font-mono text-indigo-600">{log.productId}</td>
                  <td className={`td-style text-center font-semibold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.change > 0 ? `+${log.change}` : log.change}
                  </td>
                  <td className="td-style">{log.reason}</td>
                  <td className="td-style text-gray-500">{log.notes}</td>
                  <td className="td-style text-gray-500">{log.userId}</td>
                  <td className="td-style text-gray-500"><ClientDate date={log.createdAt} /></td>
                  <td className="td-style">
                    <button onClick={() => handleEdit(log)} className="text-indigo-600 hover:text-indigo-900 mr-4 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(log.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}