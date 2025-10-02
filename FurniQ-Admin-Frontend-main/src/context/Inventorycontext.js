'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// The base URL for your API is read from environment variables.
// This makes the code portable between development and production.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  // 1. Fetch all logs from the API when the component first loads.
  useEffect(() => {
    const fetchLogs = async () => {
      if (!API_BASE_URL) {
        console.error("API URL is not defined. Please check your .env.local file.");
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/inventory-logs`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        const data = await response.json();
        // Sort logs by creation date, with the newest ones first.
        setLogs(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        console.error("Error fetching inventory logs:", error);
      }
    };
    fetchLogs();
  }, []);

  // 2. Create a new log by sending data to the API.
  const addLog = async (logData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (!response.ok) throw new Error('Failed to create log');
      const newLog = await response.json();
      // Add the new log from the server to the top of our local state.
      setLogs(prevLogs => [newLog, ...prevLogs]);
    } catch (error) {
      console.error("Error creating inventory log:", error);
    }
  };

  // 3. Update an existing log via the API.
  const updateLog = async (logId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory-logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update log');
      const updatedLog = await response.json();
      // Replace the old log with the updated one in our local state.
      setLogs(logs.map(log =>
        log.id === logId ? updatedLog : log
      ));
    } catch (error) {
      console.error("Error updating inventory log:", error);
    }
  };

  // 4. Delete a log via the API.
  const deleteLog = async (logId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory-logs/${logId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete log');
      // Remove the deleted log from our local state.
      setLogs(logs.filter(log => log.id !== logId));
    } catch (error) {
      console.error("Error deleting inventory log:", error);
    }
  };

  const value = { logs, addLog, updateLog, deleteLog };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};