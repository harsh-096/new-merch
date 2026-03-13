"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  children?: Category[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  shortDescription: string | null;
  category: { name: string; slug: string };
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (search) {
      fetch(`/api/products?search=${encodeURIComponent(search)}&limit=40`)
        .then((r) => r.json())
        .then((data) => setSearchResults(data.products || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      fetch("/api/categories?parentOnly=true&includeChildren=true")
        .then((r) => r.json())
        .then(setCategories)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [search]);

  if (loading) {
    return (
      <div className="container-main py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (search) {
    return (
      <div className="container-main py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for &quot;{search}&quot;
        </h1>
        <p className="text-gray-500 mb-8">{searchResults.length} products found</p>

        {searchResults.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No products found matching your search.</p>
            <Link href="/categories" className="text-primary-600 hover:underline mt-2 inline-block">
              Browse all categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {searchResults.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs text-primary-600 font-medium">
                    {product.category.name}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 mt-1 group-hover:text-primary-600 transition">
                    {product.name}
                  </h3>
                  <p className="text-sm font-bold text-gray-900 mt-2">
                    From {formatPrice(product.basePrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
      <p className="text-gray-500 mb-8">
        Browse our complete range of print products
      </p>

      <div className="space-y-12">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-xl font-bold text-gray-900 hover:text-primary-600 transition"
                >
                  {cat.name}
                </Link>
                {cat.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                )}
              </div>
              <Link
                href={`/categories/${cat.slug}`}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All →
              </Link>
            </div>

            {cat.children && cat.children.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {cat.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.slug}`}
                    className="group bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-primary-100 transition-all text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center">
                      <span className="text-lg">{child.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition">
                      {child.name}
                    </h3>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-primary-600 hover:underline"
                >
                  View {cat.name} products →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
