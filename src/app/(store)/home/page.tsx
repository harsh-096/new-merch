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
  Send,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { siteConfig } from "@/lib/config";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/categories?parentOnly=true")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you shortly.");
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 1000);
  };

  const trustItems = [
    {
      icon: Truck,
      label: "UK-Wide Delivery",
      sub: siteConfig.promo.deliveryBanner,
    },
    {
      icon: Shield,
      label: "Quality Guaranteed",
      sub: "Premium materials",
    },
    {
      icon: Clock,
      label: "Fast Turnaround",
      sub: "2-5 working days",
    },
    {
      icon: Star,
      label: "Expert Support",
      sub: "Artwork help included",
    },
  ];

  return (
    <div>
      {/* Hero with background image */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/40 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${siteConfig.promo.heroImage}')`,
          }}
        />
        <div className="container-main relative z-20 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm">
                {siteConfig.promo.dispatchNotice}
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Your One-Stop
              <br />
              <span className="text-primary-400">Print Shop</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg">
              {siteConfig.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/categories/banner"
                className="px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition shadow-lg shadow-primary-600/25"
              >
                Browse Products
              </Link>
              <a
                href="#contact"
                className="px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition flex items-center gap-2"
              >
                Get a Quote <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b">
        <div className="container-main py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-50 rounded-xl">
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

      {/* Categories Grid */}
      <section className="bg-gray-50">
        <div className="container-main py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              What Would You Like to Print?
            </h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
              Choose a category below to explore our range of products
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all"
              >
                <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                      <span className="text-4xl text-primary-300">
                        {cat.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 mt-2">
                    View Products <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="bg-white">
        <div className="container-main py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
              <p className="text-gray-500 mt-3 leading-relaxed">
                Need a custom quote or have questions about our products? Fill in
                the form and we&apos;ll get back to you within 24 hours.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-50 rounded-xl">
                    <Phone className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">
                      {siteConfig.contact.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-50 rounded-xl">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">
                      {siteConfig.contact.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Address
                    </p>
                    <p className="text-sm text-gray-500">
                      {siteConfig.contact.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleContact}
              className="bg-gray-50 rounded-2xl p-6 lg:p-8 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                    placeholder="john@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  placeholder="Custom quote request"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
