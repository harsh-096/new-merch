"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { name: string } | null;
  children?: Category[];
}

interface Variant {
  size: string;
  material: string;
  finish: string;
  quantity: number;
  price: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const [variants, setVariants] = useState<Variant[]>([
    { size: "", material: "", finish: "", quantity: 1, price: 0 },
  ]);

  useEffect(() => {
    fetch("/api/categories?parentOnly=true&includeChildren=true&includeAll=true")
      .then((r) => r.json())
      .then((cats: Category[]) => {
        setCategories(cats);
        const flat: Category[] = [];
        cats.forEach((c) => {
          flat.push(c);
          c.children?.forEach((ch) =>
            flat.push({ ...ch, parent: { name: c.name } })
          );
        });
        setAllCategories(flat);
      })
      .catch(() => {});
  }, []);

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

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        variants: validVariants,
      }),
    });

    setSaving(false);

    if (res.ok) {
      toast.success("Product created");
      router.push("/admin/products");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to create product");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Product</h1>

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
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
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
                  Images will upload to:{" "}
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
              disabled={uploading || !form.categoryId}
            />
          </label>
          {!form.categoryId && (
            <p className="text-xs text-amber-600 mt-2">
              Select a category first so images upload to the correct Cloudinary
              folder.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Artwork</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artwork Template (PDF/AI)
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
                placeholder="## How to Create Your Artwork&#10;&#10;1. Download the template above&#10;2. Set up your document at 300 DPI&#10;3. Include 3mm bleed on all sides&#10;4. Keep important content within the safe area&#10;5. Use CMYK colour mode&#10;6. Export as PDF"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              Variants (Size / Material / Quantity / Price)
            </h2>
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
                    placeholder="e.g. A4, 800x2000mm"
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
                    placeholder="e.g. 350gsm Silk"
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
                    placeholder="e.g. Matt"
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
            {saving ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
