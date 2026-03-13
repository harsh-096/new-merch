"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

interface Address {
  id: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  phone: string | null;
  isDefault: boolean;
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    county: "",
    postcode: "",
    phone: "",
    isDefault: true,
  });

  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  useEffect(() => {
    if (session) {
      fetch("/api/addresses")
        .then((r) => r.json())
        .then((data: Address[]) => {
          setAddresses(data);
          const defaultAddr = data.find((a) => a.isDefault);
          if (defaultAddr) setSelectedAddress(defaultAddr.id);
          else if (data.length > 0) setSelectedAddress(data[0].id);
        })
        .catch(() => {});
    }
  }, [session]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });

    if (res.ok) {
      const addr = await res.json();
      setAddresses((prev) => [addr, ...prev]);
      setSelectedAddress(addr.id);
      setShowAddressForm(false);
      setAddressForm({
        name: "",
        line1: "",
        line2: "",
        city: "",
        county: "",
        postcode: "",
        phone: "",
        isDefault: true,
      });
      toast.success("Address added");
    } else {
      toast.error("Failed to add address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!session) {
      toast.error("Please sign in to place an order");
      router.push("/login");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setPlacing(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          variantId: item.variantId,
          size: item.size,
          material: item.material,
          finish: item.finish,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          artworkUrl: item.artworkUrl,
        })),
        addressId: selectedAddress,
        notes,
      }),
    });

    setPlacing(false);

    if (res.ok) {
      clearCart();
      toast.success("Order placed successfully!");
      router.push("/account/orders");
    } else {
      toast.error("Failed to place order");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-main py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-6">
          Browse our products and add items to your cart
        </p>
        <Link
          href="/categories"
          className="inline-flex px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4"
            >
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={80}
                  height={80}
                  unoptimized
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                  N/A
                </div>
              )}

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.size}
                  {item.material && ` · ${item.material}`}
                  {item.finish && ` · ${item.finish}`}
                </p>
                {item.artworkFileName && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Artwork: {item.artworkFileName}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="p-1 border rounded hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 border rounded hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal ({items.length} items)
                </span>
                <span className="font-medium">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="text-green-600 font-medium">TBC</span>
              </div>
            </div>

            <div className="border-t pt-3 mb-5">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {!session ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Sign in to place your order
                </p>
                <Link
                  href="/login"
                  className="block w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition text-center"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <>
                {/* Address Selection */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </label>

                  {addresses.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition ${
                            selectedAddress === addr.id
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={addr.id}
                            checked={selectedAddress === addr.id}
                            onChange={(e) =>
                              setSelectedAddress(e.target.value)
                            }
                            className="mt-0.5"
                          />
                          <div className="text-xs">
                            <p className="font-medium text-gray-900">
                              {addr.name}
                            </p>
                            <p className="text-gray-500">
                              {addr.line1}, {addr.city}, {addr.postcode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add New Address
                  </button>

                  {showAddressForm && (
                    <form
                      onSubmit={handleAddAddress}
                      className="mt-3 space-y-2"
                    >
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Address Line 1"
                        value={addressForm.line1}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, line1: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2"
                        value={addressForm.line2}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, line2: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, city: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Postcode"
                          value={addressForm.postcode}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              postcode: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition"
                      >
                        Save Address
                      </button>
                    </form>
                  )}
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Special instructions..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddress}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
