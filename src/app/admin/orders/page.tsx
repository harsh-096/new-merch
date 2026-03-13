"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  notes: string | null;
  user: { id: string; name: string; email: string };
  items: Array<{ id: string; productName: string; quantity: number; unitPrice: number; size: string; artworkUrl?: string }>;
  address: { name: string; line1: string; city: string; postcode: string };
}

const statuses = ["ALL", "PENDING", "CONFIRMED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"];
const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PRODUCTION: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const nextStatus: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "IN_PRODUCTION",
  IN_PRODUCTION: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = (p = page, f = filter) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p.toString(), limit: "20" });
    if (f !== "ALL") params.set("status", f);

    fetch(`/api/orders?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Order updated to ${newStatus.replace("_", " ")}`);
      fetchOrders();
    } else {
      toast.error("Failed to update order");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === s
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          </div>
        ) : orders.length === 0 ? (
          <p className="p-6 text-center text-gray-400">No orders found</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => (
              <div key={order.id}>
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50"
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user.name}
                      </p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="px-4 pb-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h4>
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm py-1">
                            <span>
                              {item.productName} ({item.size}) x{item.quantity}
                              {item.artworkUrl && (
                                <a
                                  href={item.artworkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-primary-600 hover:underline text-xs"
                                >
                                  View Artwork
                                </a>
                              )}
                            </span>
                            <span className="font-medium">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Delivery</h4>
                        <p className="text-sm text-gray-600">
                          {order.address.name}<br />
                          {order.address.line1}<br />
                          {order.address.city}, {order.address.postcode}
                        </p>
                        {order.notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            Notes: {order.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {nextStatus[order.status] && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => updateStatus(order.id, nextStatus[order.status])}
                          className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition"
                        >
                          Mark as {nextStatus[order.status].replace("_", " ")}
                        </button>
                        {order.status !== "CANCELLED" && (
                          <button
                            onClick={() => updateStatus(order.id, "CANCELLED")}
                            className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-sm rounded-lg transition"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
