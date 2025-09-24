"use client";
import { useParams } from "next/navigation";

export default function CustomerDetails() {
  const { id } = useParams();

  // Later you'll fetch real data by `id` from API/DB
  // For now, mock details for demo
  const mockCustomers = {
    "1": {
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
    "2": {
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
  };

  const customer = mockCustomers[id];

  if (!customer) {
    return <p className="p-6">Customer not found</p>;
  }

  return (
    <div className="md:ml-64 pt-16 p-6">
      <h2 className="text-2xl font-semibold mb-6">Customer Details</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Address:</strong> {customer.address}, {customer.city}, {customer.state} {customer.zipCode}</p>
        <p><strong>Joined:</strong> {new Date(customer.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
