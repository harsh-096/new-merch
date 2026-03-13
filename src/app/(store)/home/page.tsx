"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Truck,
  Shield,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
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

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/categories?parentOnly=true")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});

    fetch("/api/products?featured=true&limit=8")
      .then((r) => r.json())
      .then((data) => setFeatured(data.products || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="container-main py-20 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Professional Print
              <br />
              <span className="text-primary-200">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg text-primary-100 leading-relaxed">
              From business cards to large format banners, we deliver
              high-quality print products with fast turnaround times and
              competitive prices.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/categories"
                className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition"
              >
                Browse Products
              </Link>
              <Link
                href="/categories"
                className="px-6 py-3 border border-primary-300 text-white font-semibold rounded-xl hover:bg-primary-600 transition flex items-center gap-2"
              >
                View All Categories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-gray-50 border-b">
        <div className="container-main py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: "UK-Wide Delivery", sub: "Fast & reliable" },
              { icon: Shield, label: "Quality Guaranteed", sub: "Premium materials" },
              { icon: Clock, label: "Quick Turnaround", sub: "2-5 working days" },
              { icon: Star, label: "Expert Support", sub: "Artwork assistance" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <item.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-main py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Our Print Products
            </h2>
            <p className="text-gray-500 mt-1">
              Everything you need for your business
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 12).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-primary-100 transition-all"
            >
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={80}
                  height={80}
                  className="w-16 h-16 object-contain mx-auto mb-3"
                />
              ) : (
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">
                    {cat.name.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-primary-600 transition">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-xs text-gray-400 text-center mt-1 line-clamp-2">
                  {cat.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="bg-gray-50">
          <div className="container-main py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Featured Products
                </h2>
                <p className="text-gray-500 mt-1">Our best sellers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
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
                    {product.shortDescription && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                    <p className="text-sm font-bold text-gray-900 mt-2">
                      From {formatPrice(product.basePrice)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary-700">
        <div className="container-main py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-primary-200 mb-8 max-w-lg mx-auto">
            Browse our full range of print products and get your order started
            today. Need help with your artwork? Our team is here to assist.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition"
          >
            Browse All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
