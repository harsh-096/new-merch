"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronDown } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  children: Category[];
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
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSidebar, setExpandedSidebar] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const slug = params.slug as string;

    fetch("/api/categories?parentOnly=true&includeChildren=true")
      .then((r) => r.json())
      .then((cats: Category[]) => {
        setAllCategories(cats);

        let found: Category | null = null;
        let parent: Category | null = null;

        for (const c of cats) {
          if (c.slug === slug) {
            found = c;
            break;
          }
          if (c.children) {
            for (const ch of c.children) {
              if (ch.slug === slug) {
                found = ch;
                parent = c;
                break;
              }
            }
          }
          if (found) break;
        }

        if (found) {
          setCategory(found);
          setParentCategory(parent);

          const expanded = new Set<string>();
          if (parent) {
            expanded.add(parent.slug);
          } else {
            expanded.add(found.slug);
          }
          setExpandedSidebar(expanded);

          fetch(`/api/products?category=${slug}&limit=50`)
            .then((r) => r.json())
            .then((data) => setProducts(data.products || []))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  const toggleSidebar = (slug: string) => {
    setExpandedSidebar((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

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
        <h1 className="text-2xl font-bold text-gray-900">
          Category Not Found
        </h1>
        <Link
          href="/home"
          className="text-primary-600 hover:underline mt-4 inline-block"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  const hasSubcategories = category.children && category.children.length > 0;
  const currentSlug = params.slug as string;

  return (
    <div className="container-main py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/home" className="hover:text-primary-600 transition">
          Home
        </Link>
        {parentCategory && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/categories/${parentCategory.slug}`}
              className="hover:text-primary-600 transition"
            >
              {parentCategory.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      <div className="flex gap-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-36 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Categories
              </h3>
            </div>
            <nav className="py-1">
              {allCategories.map((cat) => {
                const isParentActive =
                  cat.slug === currentSlug ||
                  cat.children?.some((c) => c.slug === currentSlug);
                const isExpanded = expandedSidebar.has(cat.slug);
                const hasKids = cat.children && cat.children.length > 0;

                return (
                  <div key={cat.id}>
                    <div className="flex items-center">
                      <Link
                        href={`/categories/${cat.slug}`}
                        className={cn(
                          "flex-1 flex items-center gap-2 px-4 py-2.5 text-sm transition",
                          isParentActive
                            ? "text-primary-600 font-semibold bg-primary-50"
                            : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                        )}
                      >
                        {cat.image && (
                          <Image
                            src={cat.image}
                            alt=""
                            width={24}
                            height={24}
                            unoptimized
                            className="w-6 h-6 rounded object-cover"
                          />
                        )}
                        <span className="truncate">{cat.name}</span>
                      </Link>
                      {hasKids && (
                        <button
                          onClick={() => toggleSidebar(cat.slug)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {hasKids && isExpanded && (
                      <div className="pb-1">
                        {cat.children!.map((child) => {
                          const isChildActive = child.slug === currentSlug;
                          return (
                            <Link
                              key={child.id}
                              href={`/categories/${child.slug}`}
                              className={cn(
                                "block pl-10 pr-4 py-2 text-sm transition",
                                isChildActive
                                  ? "text-primary-600 font-medium bg-primary-50/50"
                                  : "text-gray-500 hover:text-primary-600 hover:bg-gray-50"
                              )}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 min-w-0">
          {/* Category header */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-500 mt-2 max-w-2xl">
                {category.description}
              </p>
            )}
          </div>

          {/* Subcategory chips */}
          {hasSubcategories && (
            <div className="flex flex-wrap gap-2 mb-6">
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition"
                >
                  {child.image && (
                    <Image
                      src={child.image}
                      alt=""
                      width={20}
                      height={20}
                      unoptimized
                      className="w-5 h-5 rounded object-cover"
                    />
                  )}
                  {child.name}
                </Link>
              ))}
            </div>
          )}

          {/* Products grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                        {product.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition line-clamp-1">
                      {product.name}
                    </h3>
                    {product.shortDescription && (
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-[11px] text-gray-500">From</span>
                      <span className="text-xs font-bold text-gray-900">
                        {formatPrice(
                          product.variants.length > 0
                            ? Math.min(
                                ...product.variants.map((v) => v.price)
                              )
                            : product.basePrice
                        )}
                      </span>
                    </div>
                    {product.variants.length > 0 && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {
                          [...new Set(product.variants.map((v) => v.size))]
                            .length
                        }{" "}
                        sizes available
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !hasSubcategories && (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <p className="text-gray-400 text-lg">
                  No products in this category yet.
                </p>
                <Link
                  href="/home"
                  className="text-primary-600 hover:underline mt-2 inline-block"
                >
                  Browse other categories
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
