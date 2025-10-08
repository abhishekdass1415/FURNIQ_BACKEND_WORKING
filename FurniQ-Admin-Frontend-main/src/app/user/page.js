'use client'

import { useEffect, useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';

// --- Main Page Component ---
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // --- State for modals ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Used for editing or deleting

  // Dynamically determines the base URL to make API calls work in any environment.
  const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

  // --- Data Fetching ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(new URL('/api/users', API_BASE_URL));
      if (!res.ok) throw new Error("Failed to fetch users. Please check the API connection.");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, [API_BASE_URL]);

  // --- Modal Controls ---
  const handleOpenModal = (user = null) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleOpenDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentUser(null);
  };

  // --- API Operations ---
  const handleSaveUser = async (userData) => {
    const method = currentUser ? 'PUT' : 'POST';
    const url = currentUser ? `/api/users/${currentUser.id}` : '/api/users';

    try {
      const res = await fetch(new URL(url, API_BASE_URL), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${currentUser ? 'update' : 'create'} user.`);
      }
      await fetchUsers(); // Refresh the user list
      handleCloseModal();
    } catch (err) {
      // In a real app, you might use a toast notification here
      alert(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(new URL(`/api/users/${currentUser.id}`, API_BASE_URL), {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Failed to delete user.");
      await fetchUsers(); // Refresh the user list
      handleCloseDeleteModal();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Filtering Logic ---
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center p-8 font-semibold text-gray-600">Loading users...</div>;
  if (error) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;

  return (
    <div className="w-full">
      {/* --- Modals --- */}
      {isModalOpen && <UserModal user={currentUser} onSave={handleSaveUser} onClose={handleCloseModal} />}
      {isDeleteModalOpen && <DeleteConfirmModal user={currentUser} onDelete={handleDeleteUser} onClose={handleCloseDeleteModal} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">All Users ({filteredUsers.length})</h3>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.role}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                    <button onClick={() => handleOpenDeleteModal(user)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">No users match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


// --- Add/Edit User Modal Component ---
const UserModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'Viewer',
    status: user?.status || 'Active'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    // Do not send an empty password on update, as it might overwrite the existing one.
    if (user && !dataToSave.password) {
      delete dataToSave.password;
    }
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{user ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="input-style" />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className="input-style" />
          <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={user ? 'New Password (optional)' : 'Password'} required={!user} className="input-style" />
          <select name="role" value={formData.role} onChange={handleChange} required className="input-style">
            <option value="">Select Role</option>
            <option>Admin</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
          <select name="status" value={formData.status} onChange={handleChange} required className="input-style">
            <option value="">Select Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <div className="flex justify-end gap-3 pt-4 border-t mt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Delete Confirmation Modal Component ---
const DeleteConfirmModal = ({ user, onDelete, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-2">Are you sure?</h2>
        <p className="text-gray-600 mb-6">Do you really want to delete <span className="font-semibold">{user.name}</span>? This action cannot be undone.</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={onClose} className="btn-secondary w-full">Cancel</button>
          <button type="button" onClick={onDelete} className="btn-primary bg-red-600 hover:bg-red-700 w-full">Delete</button>
        </div>
      </div>
    </div>
  )
};

