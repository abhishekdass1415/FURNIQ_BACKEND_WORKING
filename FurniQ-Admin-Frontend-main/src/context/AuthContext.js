'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // On app load, check if a token exists in localStorage to keep the user logged in
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    /**
     * Corresponds to: registerUser API
     * Registers a new user via the backend.
     */
    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');
            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    /**
     * Corresponds to: loginUser API
     * Logs in a user, gets a JWT token, and stores it.
     */
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');

            // Store token and user data in state and localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);

            router.push('/'); // Redirect to dashboard on successful login
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    /**
     * Logs the user out by clearing stored data.
     */
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    /**
     * ✅ NEW: Updates the current user's profile information.
     * This calls the /api/users/:id endpoint to save changes to the database.
     */
    const updateProfile = async (updatedData) => {
        if (!user || !user.id) return { success: false, message: 'User not logged in' };

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // If your update route is protected, you would include the token here:
                    // 'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Failed to update profile');
            const updatedUserFromServer = await response.json();

            // Update the user state and localStorage with the new, confirmed data from the server
            const newUser = { ...user, ...updatedUserFromServer };
            setUser(newUser);
            localStorage.setItem('userData', JSON.stringify(newUser));

            return { success: true };
        } catch (error) {
            console.error("Error updating profile:", error);
            return { success: false, message: error.message };
        }
    };

    /**
     * Placeholder for password reset functionality.
     * NOTE: Your backend API does not have a password reset endpoint yet.
     */
    const resetPassword = async (newPassword) => {
        console.log("Simulating password reset for:", newPassword);
        // In a real app, you would make an API call to a /reset-password endpoint here.
        return { success: true, message: 'Password reset successful!' };
    };

    // The value object provides all auth-related data and functions to the rest of the app.
    const value = { user, token, loading, login, register, logout, resetPassword, updateProfile };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
