'use client'

import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUsers = () => useContext(UserContext);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // This useEffect runs once to fetch all users from your backend API
    useEffect(() => {
        const fetchUsers = async () => {
            if (!API_BASE_URL) {
                console.error("API URL is not defined. Please check your .env.local file.");
                setLoading(false);
                return;
            }
            try {
                // Assuming your user API endpoint is at /api/users
                const response = await fetch(`${API_BASE_URL}/api/users`);
                if (!response.ok) throw new Error("Failed to fetch users");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    /**
     * Adds a new user to the database and updates the local state.
     */
    const addUser = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error("Failed to create user");
            const newUser = await response.json();
            setUsers(prev => [...prev, newUser]);
            return newUser; // Return the new user for immediate use if needed
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    /**
     * Updates a user's data in the database and refreshes the local state.
     */
    const updateUser = async (userId, updatedData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error("Failed to update user");
            const updatedUserFromServer = await response.json();
            setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updatedUserFromServer } : u)));
        } catch (error) {
            console.error(`Error updating user ${userId}:`, error);
        }
    };

    /**
     * Deletes a user from the database and removes them from the local state.
     */
    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error("Failed to delete user");
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
        }
    };

    const value = {
        users,
        loading,
        addUser,
        updateUser,
        deleteUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};