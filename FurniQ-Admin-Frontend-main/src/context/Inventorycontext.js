'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const InventoryContext = createContext()

export const useInventory = () => useContext(InventoryContext)

export const InventoryProvider = ({ children }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch inventory logs from backend
  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/inventory') // replace with your backend endpoint
      setLogs(res.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching inventory logs:', err)
      setError('Failed to load inventory logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Add a new log
  const addLog = async (logData) => {
    try {
      const res = await axios.post('/api/inventory', logData)
      setLogs(prevLogs => [res.data, ...prevLogs])
      setError(null)
    } catch (err) {
      console.error('Error adding inventory log:', err)
      setError('Failed to add inventory log')
    }
  }

  // Update a log
  const updateLog = async (logId, updatedData) => {
    try {
      const res = await axios.put(`/api/inventory/${logId}`, updatedData)
      setLogs(prevLogs => prevLogs.map(log => log.id === logId ? res.data : log))
      setError(null)
    } catch (err) {
      console.error('Error updating inventory log:', err)
      setError('Failed to update inventory log')
    }
  }

  // Delete a log
  const deleteLog = async (logId) => {
    try {
      await axios.delete(`/api/inventory/${logId}`)
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId))
      setError(null)
    } catch (err) {
      console.error('Error deleting inventory log:', err)
      setError('Failed to delete inventory log')
    }
  }

  const value = { logs, loading, error, fetchLogs, addLog, updateLog, deleteLog }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}
