"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Upload,
  X,
  ImageIcon,
  FolderOpen,
  FolderClosed,
  Package,
  Check,
  AlertCircle,
  RefreshCw,
  Cloud,
  Database,
  Link2,
} from "lucide-react";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";

/* ── Types ── */

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  visible: boolean;
  children?: Category[];
  _count?: { products: number };
}

interface CloudinaryImage {
  publicId: string;
  url: string;
  format: string;
}

interface CloudinaryFolder {
  name: string;
  path: string;
  children: CloudinaryFolder[];
  images: CloudinaryImage[];
}

type ModalMode = "create" | "edit" | "bulk-upload" | null;

/* ── Component ── */

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cloudTree, setCloudTree] = useState<CloudinaryFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(true);
  const storageFolder =
    process.env.NEXT_PUBLIC_STORAGE_FOLDER || "new-merch";
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set([storageFolder])
  );
  const [activeTab, setActiveTab] = useState<"cloudinary" | "database">(
    "cloudinary"
  );

  // Modal state
  const [modal, setModal] = useState<ModalMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentId: "",
    sortOrder: 0,
    visible: true,
  });
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Bulk upload state
  const [bulkTargetPath, setBulkTargetPath] = useState("");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResults, setBulkResults] = useState<
    { fileName: string; url?: string; error?: string }[]
  >([]);

  /* ── Fetch data ── */

  const fetchCategories = useCallback(() => {
    fetch(
      "/api/categories?parentOnly=true&includeChildren=true&includeAll=true"
    )
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  const fetchCloudinary = useCallback(() => {
    setCloudLoading(true);
    fetch(`/api/cloudinary?root=${storageFolder}`)
      .then((r) => r.json())
      .then((data: CloudinaryFolder) => {
        setCloudTree(data);
        const paths = new Set<string>([storageFolder]);
        data.children.forEach((c) => paths.add(c.path));
        setExpandedFolders(paths);
      })
      .catch(() => toast.error("Failed to load Cloudinary structure"))
      .finally(() => setCloudLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchCloudinary();
  }, [fetchCategories, fetchCloudinary]);

  /* ── Helpers ── */

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const getCategoryForCloudPath = (
    cloudName: string,
    parentCloudName?: string
  ): Category | undefined => {
    for (const cat of categories) {
      if (cat.name === cloudName && !parentCloudName) return cat;
      if (parentCloudName && cat.name === parentCloudName) {
        return cat.children?.find((c) => c.name === cloudName);
      }
      if (cat.children) {
        const found = cat.children.find((c) => c.name === cloudName);
        if (found) return found;
      }
    }
    return undefined;
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      image: "",
      parentId: "",
      sortOrder: 0,
      visible: true,
    });
    setEditingId(null);
    setModal(null);
  };

  /* ── CRUD handlers ── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, parentId: form.parentId || null }),
    });

    setSaving(false);
    if (res.ok) {
      toast.success(editingId ? "Category updated" : "Category created");
      resetForm();
      fetchCategories();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to save");
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      parentId: cat.parentId || "",
      sortOrder: cat.sortOrder,
      visible: cat.visible,
    });
    setEditingId(cat.id);
    setModal("edit");
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Delete "${name}"? This removes all subcategories and products inside it.`
      )
    )
      return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      fetchCategories();
    } else {
      toast.error("Failed to delete");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "categories");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, image: data.url }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    }
    setImageUploading(false);
  };

  /* ── Sync: create DB category from Cloudinary folder ── */

  const syncFolder = async (
    folderName: string,
    parentCategoryId?: string
  ) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: folderName,
        slug: slugify(folderName),
        description: "",
        parentId: parentCategoryId || null,
        sortOrder: 0,
        visible: true,
      }),
    });
    if (res.ok) {
      toast.success(`Category "${folderName}" created`);
      fetchCategories();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to create category");
    }
  };

  /* ── Bulk upload ── */

  const handleBulkUpload = async () => {
    if (!bulkTargetPath || !bulkFiles.length) return;
    setBulkUploading(true);
    setBulkResults([]);

    const folderWithoutRoot = bulkTargetPath.replace(/^new-merch\//, "");

    const fd = new FormData();
    bulkFiles.forEach((file) => fd.append("file", file));
    fd.append("folder", folderWithoutRoot);
    fd.append("cleanNames", "true");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.results) {
        const results = data.results.map(
          (r: { fileName: string; url: string }) => ({
            fileName: r.fileName,
            url: r.url,
          })
        );
        const errors = (data.errors || []).map(
          (e: { fileName: string; error: string }) => ({
            fileName: e.fileName,
            error: e.error,
          })
        );
        setBulkResults([...results, ...errors]);
        toast.success(`${results.length}/${bulkFiles.length} uploaded`);
      } else if (data.url) {
        setBulkResults([{ fileName: bulkFiles[0].name, url: data.url }]);
        toast.success("Uploaded");
      }
    } catch {
      toast.error("Upload failed");
    }

    setBulkUploading(false);
    fetchCloudinary();
  };

  /* ── Render: Cloudinary Folder Tree ── */

  const renderFolder = (
    folder: CloudinaryFolder,
    depth: number = 0,
    parentFolder?: CloudinaryFolder
  ) => {
    const isExpanded = expandedFolders.has(folder.path);
    const isRoot = depth === 0;
    const dbCat = getCategoryForCloudPath(
      folder.name,
      parentFolder?.name
    );
    const hasChildren = folder.children.length > 0;
    const hasImages = folder.images.length > 0;
    const indent = depth * 24;

    return (
      <div key={folder.path}>
        {/* Folder row */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition ${
            isRoot ? "bg-gradient-to-r from-indigo-50 to-white" : ""
          }`}
          style={{ paddingLeft: `${12 + indent}px` }}
          onClick={() => toggleFolder(folder.path)}
        >
          {/* Expand icon */}
          {hasChildren || hasImages ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}

          {/* Folder icon */}
          {isExpanded ? (
            <FolderOpen
              className={`w-5 h-5 flex-shrink-0 ${isRoot ? "text-indigo-500" : "text-amber-500"}`}
            />
          ) : (
            <FolderClosed
              className={`w-5 h-5 flex-shrink-0 ${isRoot ? "text-indigo-500" : "text-amber-400"}`}
            />
          )}

          {/* Folder name */}
          <span
            className={`font-medium text-sm ${isRoot ? "text-indigo-700" : "text-gray-800"}`}
          >
            {folder.name}
          </span>

          {/* Counts */}
          {hasChildren && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {folder.children.length} folder
              {folder.children.length > 1 ? "s" : ""}
            </span>
          )}
          {hasImages && (
            <span className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
              {folder.images.length} image{folder.images.length > 1 ? "s" : ""}
            </span>
          )}

          {/* DB status badge */}
          <div className="ml-auto flex items-center gap-2">
            {!isRoot && dbCat ? (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> In DB
              </span>
            ) : !isRoot ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const parentName = parentFolder?.name;
                  const parentCat = parentName
                    ? categories.find((c) => c.name === parentName)
                    : undefined;
                  syncFolder(folder.name, parentCat?.id);
                }}
                className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition"
              >
                <Link2 className="w-3 h-3" /> Sync to DB
              </button>
            ) : null}

            {/* Bulk upload button */}
            {!hasChildren && !isRoot && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBulkTargetPath(folder.path);
                  setBulkFiles([]);
                  setBulkResults([]);
                  setModal("bulk-upload");
                }}
                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                title="Upload images here"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Edit/Delete for DB categories */}
            {!isRoot && dbCat && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(dbCat);
                  }}
                  className="p-1 text-gray-400 hover:text-indigo-600 rounded transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(dbCat.id, dbCat.name);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <>
            {/* Child folders */}
            {folder.children.map((child) =>
              renderFolder(child, depth + 1, folder)
            )}

            {/* Images grid */}
            {hasImages && (
              <div
                className="px-3 py-3 bg-gray-50/70 border-b border-gray-100"
                style={{ paddingLeft: `${36 + indent}px` }}
              >
                <div className="flex flex-wrap gap-2">
                  {folder.images.map((img) => {
                    const fileName =
                      img.publicId.split("/").pop() || img.publicId;
                    return (
                      <div key={img.publicId} className="group relative">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                          <Image
                            src={img.url}
                            alt={fileName}
                            width={80}
                            height={80}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="text-white text-[10px] font-mono px-1 text-center leading-tight break-all">
                            {fileName}.{img.format}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /* ── Render: Database category list ── */

  const renderDbCategories = () => (
    <div className="divide-y divide-gray-50">
      {categories.map((cat) => (
        <div key={cat.id}>
          <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={36}
                  height={36}
                  unoptimized
                  className="w-9 h-9 rounded-lg object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                </div>
              )}
              <div>
                <span className="font-semibold text-sm text-gray-900">
                  {cat.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">/{cat.slug}</span>
                  {!cat.visible && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">
                      Hidden
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {cat.children?.length || 0} sub
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(cat)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {cat.children && cat.children.length > 0 && (
            <div className="bg-gray-50/50">
              {cat.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between px-4 py-2 pl-12 border-t border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    {child.image ? (
                      <Image
                        src={child.image}
                        alt={child.name}
                        width={28}
                        height={28}
                        unoptimized
                        className="w-7 h-7 rounded object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center">
                        <Package className="w-3 h-3 text-gray-300" />
                      </div>
                    )}
                    <span className="text-sm text-gray-700">{child.name}</span>
                    <span className="text-xs text-gray-400">
                      /{child.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(child)}
                      className="p-1 text-gray-400 hover:text-indigo-600 rounded transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(child.id, child.name)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {categories.length === 0 && (
        <p className="p-8 text-center text-gray-400 text-sm">
          No categories in database yet
        </p>
      )}
    </div>
  );

  /* ── Main render ── */

  if (loading && cloudLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchCloudinary();
              fetchCategories();
            }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setModal("create");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("cloudinary")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${
            activeTab === "cloudinary"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Cloud className="w-4 h-4" /> Cloudinary Folders
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${
            activeTab === "database"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Database className="w-4 h-4" /> Database Categories
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {activeTab === "cloudinary" ? (
          cloudLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Loading Cloudinary structure...
              </p>
            </div>
          ) : cloudTree ? (
            <div>{renderFolder(cloudTree)}</div>
          ) : (
            <p className="p-8 text-center text-gray-400">
              Could not load Cloudinary data
            </p>
          )
        ) : (
          renderDbCategories()
        )}
      </div>

      {/* Legend */}
      {activeTab === "cloudinary" && (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" /> = Folder synced to DB
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="w-3 h-3 text-amber-500" /> = Click to create DB
            category from folder
          </span>
          <span className="flex items-center gap-1">
            <Upload className="w-3 h-3 text-gray-400" /> = Upload images to
            this folder
          </span>
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Create / Edit */}
            {(modal === "create" || modal === "edit") && (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    {modal === "edit" ? "Edit Category" : "New Category"}
                  </h2>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Image
                    </label>
                    <div className="flex items-center gap-4">
                      {form.image ? (
                        <div className="relative group">
                          <Image
                            src={form.image}
                            alt=""
                            width={80}
                            height={80}
                            unoptimized
                            className="w-20 h-20 rounded-xl object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image: "" })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition">
                        <Upload className="w-4 h-4" />
                        {imageUploading ? "Uploading..." : "Upload"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={imageUploading}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value,
                            slug: editingId
                              ? form.slug
                              : slugify(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Banner"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) =>
                          setForm({ ...form, slug: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Category
                      </label>
                      <select
                        value={form.parentId}
                        onChange={(e) =>
                          setForm({ ...form, parentId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">None (top-level)</option>
                        {categories
                          .filter((c) => c.id !== editingId)
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={form.sortOrder}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sortOrder: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.visible}
                      onChange={(e) =>
                        setForm({ ...form, visible: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    Visible on storefront
                  </label>
                </div>

                <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : modal === "edit"
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            )}

            {/* Bulk Upload */}
            {modal === "bulk-upload" && (
              <div>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    Upload Images
                  </h2>
                  <button
                    onClick={() => setModal(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-indigo-50 rounded-lg px-3 py-2">
                    <p className="text-sm text-indigo-700 font-medium">
                      Target: {bulkTargetPath}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {bulkFiles.length > 0
                          ? `${bulkFiles.length} file(s) selected`
                          : "Click to select images"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          setBulkFiles(Array.from(e.target.files || []));
                          setBulkResults([]);
                        }}
                      />
                    </label>
                    {bulkFiles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {bulkFiles.map((f, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {bulkResults.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                        Results
                      </div>
                      <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                        {bulkResults.map((r, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 flex items-center gap-2 text-sm"
                          >
                            {r.url ? (
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            <span className="truncate flex-1">
                              {r.fileName}
                            </span>
                            {r.error && (
                              <span className="text-xs text-red-500">
                                {r.error}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
                  <button
                    onClick={() => setModal(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleBulkUpload}
                    disabled={bulkUploading || bulkFiles.length === 0}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {bulkUploading
                      ? "Uploading..."
                      : `Upload ${bulkFiles.length} Image${bulkFiles.length !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
