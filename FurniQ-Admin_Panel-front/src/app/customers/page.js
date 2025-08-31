"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Customers() {
  const router = useRouter();

  const [customers, setCustomers] = useState([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "9876543210",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      createdAt: "2025-07-01",
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "9876543211",
      address: "456 Market St",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      createdAt: "2025-07-05",
    },
  ]);

  const handleDeleteCustomer = (id) => {
    setCustomers(customers.filter((customer) => customer.id !== id));
  };

  return (
    <div className="md:ml-64 pt-16">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customers</h2>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{customer.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">
                            {customer.firstName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {customer.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {customer.city}, {customer.state}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteCustomer(customer.id)}
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
