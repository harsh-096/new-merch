"use client";

import { useEffect, useState } from "react";
import { Package, Users, ShoppingCart, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardData {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    user: { name: string; email: string };
    items: Array<{ productName: string }>;
  }>;
  statusCounts: Record<string, number>;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PRODUCTION: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!data) return <p className="text-red-500">Failed to load dashboard</p>;

  const stats = [
    {
      label: "Total Orders",
      value: data.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Revenue",
      value: formatPrice(data.totalRevenue),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Products",
      value: data.totalProducts,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Customers",
      value: data.totalUsers,
      icon: Users,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items.map((i) => i.productName).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                  <p className="text-sm font-semibold mt-1">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
            {data.recentOrders.length === 0 && (
              <p className="p-4 text-sm text-gray-400">No orders yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Order Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100"}`}
                >
                  {status.replace("_", " ")}
                </span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
            {Object.keys(data.statusCounts).length === 0 && (
              <p className="text-sm text-gray-400">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
