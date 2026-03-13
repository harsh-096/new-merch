"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    county: "",
    postcode: "",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetch("/api/addresses")
      .then((r) => r.json())
      .then(setAddresses)
      .catch(() => {});
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const addr = await res.json();
      setAddresses((prev) => [addr, ...prev]);
      setShowForm(false);
      setForm({ name: "", line1: "", line2: "", city: "", county: "", postcode: "", phone: "", isDefault: false });
      toast.success("Address added");
    } else {
      toast.error("Failed to add address");
    }
  };

  if (status === "loading") {
    return (
      <div className="container-main py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/home" className="hover:text-primary-600 transition">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-medium">Profile</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Account Details</h2>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-gray-500">Name</label>
              <p className="font-medium text-gray-900">{session?.user?.name}</p>
            </div>
            <div>
              <label className="text-gray-500">Email</label>
              <p className="font-medium text-gray-900">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Saved Addresses</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-4 mb-4 space-y-2">
              <input type="text" required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="text" required placeholder="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="text" placeholder="Address Line 2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <input type="text" required placeholder="Postcode" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <button type="submit" className="w-full py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition">
                Save Address
              </button>
            </form>
          )}

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{addr.name}</p>
                  <p className="text-gray-500">{addr.line1}</p>
                  <p className="text-gray-500">{addr.city}, {addr.postcode}</p>
                  {addr.isDefault && (
                    <span className="text-xs text-primary-600 font-medium">Default</span>
                  )}
                </div>
              </div>
            ))}
            {addresses.length === 0 && !showForm && (
              <p className="text-sm text-gray-400 text-center py-6">No saved addresses</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
