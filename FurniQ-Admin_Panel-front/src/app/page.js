"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [reviews, setReviews] = useState([]);

  // Fetch dashboard data from backend API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // For now, we'll use mock data since reviews endpoint doesn't exist yet
        // In the future, you can create a reviews API endpoint
        const mockReviews = [
          {
            customerName: "John Doe",
            rating: 5,
            comment: "Excellent furniture quality and fast delivery!"
          },
          {
            customerName: "Jane Smith", 
            rating: 4,
            comment: "Great service and beautiful products."
          }
        ];
        setReviews(mockReviews);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="md:ml-64 pt-16">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🔹 Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Order ID</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Customer</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4">ORD-1234</td>
                      <td className="px-6 py-4">John Doe</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                          Delivered
                        </span>
                      </td>
                      <td className="px-6 py-4">₹11,200.00</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">ORD-1235</td>
                      <td className="px-6 py-4">Jane Smith</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
                          Processing
                        </span>
                      </td>
                      <td className="px-6 py-4">₹18,500.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 🔹 Customer Reviews */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {reviews.map((review, idx) => (
                    <li key={idx} className="py-3">
                      <p className="text-gray-800 font-semibold">
                        {review.customerName}{" "}
                        <span className="text-yellow-500">
                          {"⭐".repeat(review.rating)}
                        </span>
                      </p>
                      <p className="text-gray-600">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No customer reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
