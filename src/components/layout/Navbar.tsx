"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Search,
  LayoutDashboard,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { siteConfig } from "@/lib/config";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItems = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-gray-300 text-xs">
        <div className="container-main flex items-center justify-between h-8">
          <span>{siteConfig.promo.deliveryBanner}</span>
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="hover:text-white transition">
                    Admin
                  </Link>
                )}
                <Link
                  href="/account/orders"
                  className="hover:text-white transition"
                >
                  My Account
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/home" })}
                  className="hover:text-white transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-white transition">
                  Sign In
                </Link>
                <Link href="/register" className="hover:text-white transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <Link href="/home" className="text-2xl font-bold text-primary-600">
            {siteConfig.name}
          </Link>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/categories?search=${searchQuery}`;
                  }
                }}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-primary-600 transition"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-500 hover:text-primary-600 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                  {totalItems}
                </span>
              )}
            </button>

            {session && (
              <div className="hidden md:flex items-center gap-1">
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="p-2 text-gray-500 hover:text-primary-600 transition"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  href="/account/orders"
                  className="p-2 text-gray-500 hover:text-primary-600 transition"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-500"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden border-t border-gray-100 p-3">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value;
                if (val.trim())
                  window.location.href = `/categories?search=${val}`;
              }
            }}
          />
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[70vh] overflow-y-auto">
          <div className="container-main py-3 space-y-1">
            <Link
              href="/categories"
              className="block py-2.5 px-2 text-sm font-medium text-gray-800 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              All Products
            </Link>
            <div className="border-t border-gray-100 pt-2 mt-2">
              {session ? (
                <>
                  <Link
                    href="/account/orders"
                    className="block py-2 px-2 text-sm text-gray-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Orders
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block py-2 px-2 text-sm text-gray-700"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/home" })}
                    className="block py-2 px-2 text-sm text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block py-2 px-2 text-sm font-medium text-primary-600"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
