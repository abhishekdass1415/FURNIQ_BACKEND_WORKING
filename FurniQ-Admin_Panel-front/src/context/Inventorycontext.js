"use client";
import { createContext, useContext, useState } from "react";

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([
    { id: "P001", name: "Sofa", stock: 12 },
    { id: "P002", name: "Chair", stock: 3 },
    { id: "P003", name: "Table", stock: 0 },
  ]);

  // update stock (positive or negative)
  const updateStock = (productId, change) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, stock: Math.max(0, item.stock + change) } // prevent negative stock
          : item
      )
    );
  };

  return (
    <InventoryContext.Provider value={{ inventory, updateStock }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
