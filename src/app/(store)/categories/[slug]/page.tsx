"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  children: Category[];
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  basePrice: number;
  shortDescription: string | null;
  variants: Array<{ id: string; size: string; price: number }>;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = params.slug as string;

    fetch(`/api/categories?parentOnly=false&includeChildren=true`)
      .then((r) => r.json())
      .then((cats: (Category & { children?: Category[] })[]) => {
        const flat: Category[] = [];
        cats.forEach((c) => {
          flat.push(c as Category);
          if (c.children) c.children.forEach((ch) => flat.push(ch as Category));
        });

        const found = flat.find((c) => c.slug === slug);
        if (found) {
          setCategory(found);

          fetch(`/api/products?category=${slug}&limit=50`)
            .then((r) => r.json())
            .then((data) => setProducts(data.products || []))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container-main py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-main py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Category Not Found</h1>
        <Link href="/categories" className="text-primary-600 hover:underline mt-4 inline-block">
          Browse all categories
        </Link>
      </div>
    );
  }

  const hasSubcategories = category.children && category.children.length > 0;

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/home" className="hover:text-primary-600 transition">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/categories" className="hover:text-primary-600 transition">Categories</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-gray-500 mt-2 max-w-2xl">{category.description}</p>
        )}
      </div>

      {/* Subcategories */}
      {hasSubcategories && (
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {category.children.map((child) => (
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
        </div>
      )}

      {/* Products */}
      {products.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {hasSubcategories ? "All Products" : "Products"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) => (
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
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-xs text-gray-500">From</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(
                        product.variants.length > 0
                          ? Math.min(...product.variants.map((v) => v.price))
                          : product.basePrice
                      )}
                    </span>
                  </div>
                  {product.variants.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {[...new Set(product.variants.map((v) => v.size))].length} sizes available
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        !hasSubcategories && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-400">No products in this category yet.</p>
            <Link href="/categories" className="text-primary-600 hover:underline mt-2 inline-block">
              Browse other categories
            </Link>
          </div>
        )
      )}
    </div>
  );
}
