"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: { name: string } | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  featured: boolean;
  visible: boolean;
  category: Category;
  variants: Array<{ id: string }>;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(
    (p = page, s = search) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: p.toString(),
        limit: "20",
        includeAll: "true",
      });
      if (s) params.set("search", s);

      fetch(`/api/products?${params}`)
        .then((r) => r.json())
        .then((data) => {
          setProducts(data.products);
          setTotalPages(data.totalPages);
        })
        .catch(() => toast.error("Failed to load products"))
        .finally(() => setLoading(false));
    },
    [page, search]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product and all its variants?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      fetchProducts();
    } else {
      toast.error("Failed to delete product");
    }
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    if (res.ok) {
      fetchProducts();
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !featured }),
    });
    if (res.ok) {
      fetchProducts();
    }
  };

  const getCategoryLabel = (cat: Category) => {
    if (cat.parent) return `${cat.parent.name} / ${cat.name}`;
    return cat.name;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              fetchProducts(1, search);
            }
          }}
          placeholder="Search products..."
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Product
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Price
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Variants
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-1 text-xs">
                        {product.category.parent && (
                          <>
                            <span className="text-gray-400">
                              {product.category.parent.name}
                            </span>
                            <ChevronRight className="w-3 h-3 text-gray-300" />
                          </>
                        )}
                        <span>{product.category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(product.basePrice)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.variants.length}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            product.visible
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {product.visible ? "Visible" : "Hidden"}
                        </span>
                        {product.featured && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-50 text-yellow-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            toggleFeatured(product.id, product.featured)
                          }
                          className={`p-1.5 rounded-lg transition ${
                            product.featured
                              ? "text-yellow-500 hover:bg-yellow-50"
                              : "text-gray-300 hover:text-yellow-500 hover:bg-yellow-50"
                          }`}
                          title={
                            product.featured ? "Remove featured" : "Feature"
                          }
                        >
                          <Star
                            className={`w-4 h-4 ${product.featured ? "fill-yellow-500" : ""}`}
                          />
                        </button>
                        <button
                          onClick={() =>
                            toggleVisibility(product.id, product.visible)
                          }
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition"
                          title={product.visible ? "Hide" : "Show"}
                        >
                          {product.visible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
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
