"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface Variant {
  size: string;
  material: string;
  finish: string;
  quantity: number;
  price: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    categoryId: "",
    images: [] as string[],
    basePrice: 0,
    artworkRequired: true,
    artworkTemplate: "",
    artworkInstructions: "",
    turnaroundDays: 5,
    featured: false,
    visible: true,
  });

  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(
        "/api/categories?parentOnly=true&includeChildren=true&includeAll=true"
      ).then((r) => r.json()),
      fetch(`/api/products/${params.id}`).then((r) => r.json()),
    ])
      .then(([cats, product]) => {
        setCategories(cats);
        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription || "",
          categoryId: product.categoryId,
          images: product.images || [],
          basePrice: product.basePrice,
          artworkRequired: product.artworkRequired,
          artworkTemplate: product.artworkTemplate || "",
          artworkInstructions: product.artworkInstructions || "",
          turnaroundDays: product.turnaroundDays,
          featured: product.featured,
          visible: product.visible,
        });
        setVariants(
          product.variants.map((v: Variant & { id: string }) => ({
            size: v.size,
            material: v.material || "",
            finish: v.finish || "",
            quantity: v.quantity,
            price: v.price,
          }))
        );
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const getCloudinaryFolder = (categoryId: string): string => {
    for (const parent of categories) {
      if (parent.id === categoryId) return parent.name;
      for (const child of parent.children || []) {
        if (child.id === categoryId) return `${parent.name}/${child.name}`;
      }
    }
    return "products";
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const newImages: string[] = [];
    const folder = getCloudinaryFolder(form.categoryId);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      fd.append("cleanNames", "true");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        newImages.push(data.url);
      }
    }

    setForm((f) => ({ ...f, images: [...f.images, ...newImages] }));
    setUploading(false);
    if (newImages.length) toast.success(`${newImages.length} image(s) uploaded`);
  };

  const handleTemplateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", `templates/${form.slug || "temp"}`);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setForm((f) => ({ ...f, artworkTemplate: data.url }));
    }
    setUploading(false);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { size: "", material: "", finish: "", quantity: 1, price: 0 },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const validVariants = variants.filter((v) => v.size && v.price > 0);

    const res = await fetch(`/api/products/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, variants: validVariants }),
    });

    setSaving(false);

    if (res.ok) {
      toast.success("Product updated");
      router.push("/admin/products");
    } else {
      toast.error("Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {cat.children?.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                    {(!cat.children || cat.children.length === 0) && (
                      <option value={cat.id}>{cat.name}</option>
                    )}
                  </optgroup>
                ))}
              </select>
              {form.categoryId && (
                <p className="text-xs text-gray-400 mt-1">
                  New images will upload to:{" "}
                  {getCloudinaryFolder(form.categoryId)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (&pound;)
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={form.basePrice}
                onChange={(e) =>
                  setForm({
                    ...form,
                    basePrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turnaround (days)
              </label>
              <input
                type="number"
                min="1"
                value={form.turnaroundDays}
                onChange={(e) =>
                  setForm({
                    ...form,
                    turnaroundDays: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="rounded"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) =>
                    setForm({ ...form, visible: e.target.checked })
                  }
                  className="rounded"
                />
                Visible
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.artworkRequired}
                  onChange={(e) =>
                    setForm({ ...form, artworkRequired: e.target.checked })
                  }
                  className="rounded"
                />
                Artwork Required
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Product Images</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {form.images.map((img, i) => (
              <div key={i} className="relative group">
                <Image
                  src={img}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="w-24 h-24 rounded-lg object-cover border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      images: form.images.filter((_, j) => j !== i),
                    })
                  }
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Artwork</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artwork Template
              </label>
              <div className="flex items-center gap-3">
                {form.artworkTemplate && (
                  <a
                    href={form.artworkTemplate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    View template
                  </a>
                )}
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-4 h-4" />
                  {form.artworkTemplate ? "Replace" : "Upload Template"}
                  <input
                    type="file"
                    accept=".pdf,.ai,.eps"
                    className="hidden"
                    onChange={handleTemplateUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artwork Instructions (Markdown)
              </label>
              <textarea
                rows={6}
                value={form.artworkInstructions}
                onChange={(e) =>
                  setForm({ ...form, artworkInstructions: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Add Variant
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={i}
                className="flex flex-wrap items-end gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs text-gray-500 mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={v.size}
                    onChange={(e) => updateVariant(i, "size", e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs text-gray-500 mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    value={v.material}
                    onChange={(e) =>
                      updateVariant(i, "material", e.target.value)
                    }
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-xs text-gray-500 mb-1">
                    Finish
                  </label>
                  <input
                    type="text"
                    value={v.finish}
                    onChange={(e) => updateVariant(i, "finish", e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={v.quantity}
                    onChange={(e) =>
                      updateVariant(i, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">
                    Price (&pound;)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={v.price}
                    onChange={(e) =>
                      updateVariant(
                        i,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {variants.length === 0 && (
              <p className="text-sm text-gray-400 p-3">
                No variants. Click &quot;Add Variant&quot; to add
                size/material/price options.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
