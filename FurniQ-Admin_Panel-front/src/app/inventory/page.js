"use client";
import { useState } from "react";
import { useInventory } from "@/context/Inventorycontext";

// A reusable date formatting component that only runs on the client
function ClientDate({ date }) {
  if (!date) return "-";
  const d = new Date(date);
  return <>{d.toLocaleString("en-US", { hour12: true })}</>;
}

export default function InventoryLogs() {
  const { updateStock } = useInventory();

  const [logs, setLogs] = useState([
    {
      id: 1,
      productId: "P001",
      change: 10,
      reason: "Stock Added",
      notes: "New shipment arrived",
      createdAt: new Date().toISOString(),
      userId: "admin123",
    },
    {
      id: 2,
      productId: "P002",
      change: -5,
      reason: "Order Shipped",
      notes: "Shipped to customer",
      createdAt: new Date().toISOString(),
      userId: "staff456",
    },
  ]);

  const [form, setForm] = useState({
    productId: "",
    change: "",
    reason: "",
    notes: "",
    userId: "",
  });

  const [editingId, setEditingId] = useState(null);

  const handleAddLog = () => {
    if (!form.productId || !form.change || !form.reason) return;

    if (editingId) {
      // Update existing log
      setLogs((prev) =>
        prev.map((log) =>
          log.id === editingId
            ? { ...log, ...form, change: parseInt(form.change, 10) }
            : log
        )
      );

      // 🔥 Also update stock when editing
      updateStock(form.productId, parseInt(form.change, 10));

      setEditingId(null);
    } else {
      // Add new log
      const newLog = {
        id: logs.length + 1,
        ...form,
        change: parseInt(form.change, 10),
        createdAt: new Date().toISOString(),
      };

      setLogs((prev) => [...prev, newLog]);

      // 🔥 Update inventory stock
      updateStock(newLog.productId, newLog.change);
    }

    setForm({ productId: "", change: "", reason: "", notes: "", userId: "" });
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

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this log?"
    );
    if (confirmDelete) {
      setLogs((prev) => prev.filter((log) => log.id !== id));
      // ❌ Optional: reverse stock change when deleting log
      // const deletedLog = logs.find((l) => l.id === id);
      // if (deletedLog) updateStock(deletedLog.productId, -deletedLog.change);
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
            <input
              type="text"
              placeholder="Product ID"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="border rounded p-2"
            />
            <input
              type="number"
              placeholder="Change (+/-)"
              value={form.change}
              onChange={(e) => setForm({ ...form, change: e.target.value })}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="border rounded p-2"
            />
            <input
              type="text"
              placeholder="User ID"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="border rounded p-2"
            />
          </div>
          <button
            onClick={handleAddLog}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {editingId ? "Update Log" : "Add Log"}
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
          <h3 className="text-lg font-semibold mb-4">Logs</h3>
          <table className="w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Product ID</th>
                <th className="border px-3 py-2 text-left">Change</th>
                <th className="border px-3 py-2 text-left">Reason</th>
                <th className="border px-3 py-2 text-left">Notes</th>
                <th className="border px-3 py-2 text-left">User ID</th>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="border px-3 py-2">{log.productId}</td>
                  <td className="border px-3 py-2">{log.change}</td>
                  <td className="border px-3 py-2">{log.reason}</td>
                  <td className="border px-3 py-2">{log.notes}</td>
                  <td className="border px-3 py-2">{log.userId}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
