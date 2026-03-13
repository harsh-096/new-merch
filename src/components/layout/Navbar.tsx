"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Search,
  LayoutDashboard,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export default function Navbar() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItems = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    fetch("/api/categories?parentOnly=true&includeChildren=true")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/home" className="text-2xl font-bold text-primary-600">
              NewMerch
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <div
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition">
                  Products <ChevronDown className="w-4 h-4" />
                </button>

                {megaOpen && (
                  <div className="absolute top-full left-0 mt-0 pt-2">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 grid grid-cols-3 gap-6 w-[640px]">
                      {categories.map((cat) => (
                        <div key={cat.id}>
                          <Link
                            href={`/categories/${cat.slug}`}
                            className="font-semibold text-sm text-gray-900 hover:text-primary-600 transition"
                            onClick={() => setMegaOpen(false)}
                          >
                            {cat.name}
                          </Link>
                          {cat.children && cat.children.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {cat.children.map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={`/categories/${child.slug}`}
                                    className="text-sm text-gray-500 hover:text-primary-600 transition"
                                    onClick={() => setMegaOpen(false)}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/categories"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >
                All Categories
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block relative">
              {searchOpen ? (
                <div className="flex items-center gap-2">
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
                    className="w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                  <button onClick={() => setSearchOpen(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-500 hover:text-primary-600 transition"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-500 hover:text-primary-600 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {session ? (
              <div className="hidden md:flex items-center gap-3">
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="p-2 text-gray-500 hover:text-primary-600 transition"
                    title="Admin Panel"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  href="/account/orders"
                  className="p-2 text-gray-500 hover:text-primary-600 transition"
                  title="My Account"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/home" })}
                  className="p-2 text-gray-500 hover:text-red-500 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
              >
                Sign In
              </Link>
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

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="container-main py-4 space-y-3">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value;
                  if (val.trim()) window.location.href = `/categories?search=${val}`;
                }
              }}
            />
            <Link
              href="/categories"
              className="block py-2 text-sm font-medium text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              All Categories
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="block py-2 text-sm text-gray-600"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-3">
              {session ? (
                <>
                  <Link
                    href="/account/orders"
                    className="block py-2 text-sm text-gray-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    My Orders
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block py-2 text-sm text-gray-700"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/home" })}
                    className="block py-2 text-sm text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "block py-2 text-sm font-medium text-primary-600"
                  )}
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
