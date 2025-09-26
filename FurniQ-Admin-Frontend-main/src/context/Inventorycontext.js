"use client";
import { createContext, useContext, useState, useEffect } from "react";

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch inventory logs from API
  const fetchInventoryLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventories`);
      if (response.ok) {
        const data = await response.json();
        setInventoryLogs(data);
        setError(null);
      } else {
        console.error('Failed to fetch inventory logs');
        setInventoryLogs([]);
      }
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      setError('Failed to load inventory logs.');
      setInventoryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Load inventory logs on mount
  useEffect(() => {
    fetchInventoryLogs();
  }, []);

  // Create inventory log entry
  const createInventoryLog = async (logData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      });

      if (response.ok) {
        const newLog = await response.json();
        setInventoryLogs(prev => [newLog, ...prev]);
        return newLog;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create inventory log');
      }
    } catch (error) {
      console.error('Error creating inventory log:', error);
      throw error;
    }
  };

  // Update stock (positive or negative) - this creates an inventory log
  const updateStock = async (productId, change, reason, notes = '') => {
    try {
      const logData = {
        productId,
        change: parseInt(change),
        reason,
        notes
      };
      
      await createInventoryLog(logData);
      
      // Refresh inventory logs to get updated data
      await fetchInventoryLogs();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      inventory, 
      inventoryLogs, 
      loading, 
      error, 
      updateStock, 
      createInventoryLog,
      fetchInventoryLogs 
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
