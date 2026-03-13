"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Clock, Truck } from "lucide-react";
import toast from "react-hot-toast";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import ArtworkInstructions from "@/components/product/ArtworkInstructions";
import ArtworkUploader from "@/components/product/ArtworkUploader";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  images: string[];
  basePrice: number;
  artworkRequired: boolean;
  artworkTemplate: string | null;
  artworkInstructions: string | null;
  turnaroundDays: number;
  featured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    parent: { id: string; name: string; slug: string } | null;
  };
  variants: Array<{
    id: string;
    size: string;
    material: string | null;
    finish: string | null;
    quantity: number;
    price: number;
  }>;
}

interface Selection {
  variantId?: string;
  size: string;
  material?: string;
  finish?: string;
  quantity: number;
  price: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [artworkUrl, setArtworkUrl] = useState("");
  const [artworkFileName, setArtworkFileName] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "specs">(
    "description"
  );

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleSelectionChange = useCallback((sel: Selection) => {
    setSelection(sel);
  }, []);

  const handleArtworkUpload = useCallback((url: string, fileName: string) => {
    setArtworkUrl(url);
    setArtworkFileName(fileName);
  }, []);

  const handleAddToCart = () => {
    if (!product || !selection) return;

    if (product.artworkRequired && !artworkUrl) {
      toast.error("Please upload your artwork before adding to cart");
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images[0] || "",
      variantId: selection.variantId,
      size: selection.size,
      material: selection.material,
      finish: selection.finish,
      quantity: selection.quantity,
      unitPrice: selection.price,
      artworkUrl: artworkUrl || undefined,
      artworkFileName: artworkFileName || undefined,
    });

    toast.success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="container-main py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-main py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
        <Link
          href="/categories"
          className="text-primary-600 hover:underline mt-4 inline-block"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/home" className="hover:text-primary-600 transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/categories" className="hover:text-primary-600 transition">
          Products
        </Link>
        {product.category.parent && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/categories/${product.category.parent.slug}`}
              className="hover:text-primary-600 transition"
            >
              {product.category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-primary-600 transition"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative mb-3">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                className="object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
                {product.name.charAt(0)}
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === i
                      ? "border-primary-500"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={64}
                    height={64}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info + Configurator */}
        <div>
          <span className="text-sm font-medium text-primary-600">
            {product.category.name}
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
            {product.name}
          </h1>
          {product.shortDescription && (
            <p className="text-gray-500 mt-2">{product.shortDescription}</p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {product.turnaroundDays} day turnaround
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              UK delivery
            </span>
          </div>

          {/* Price for products with no variants */}
          {product.variants.length === 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatPrice(product.basePrice)}
              </p>
            </div>
          )}

          {/* Configurator */}
          <div className="mt-6">
            <ProductConfigurator
              variants={product.variants}
              basePrice={product.basePrice}
              onSelectionChange={handleSelectionChange}
            />
          </div>

          {/* Artwork Section */}
          <div className="mt-6 space-y-4">
            <ArtworkInstructions
              instructions={product.artworkInstructions}
              templateUrl={product.artworkTemplate}
              productName={product.name}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Upload Your Artwork
                {product.artworkRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
                {!product.artworkRequired && (
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                )}
              </label>
              <ArtworkUploader
                productSlug={product.slug}
                onUpload={handleArtworkUpload}
                currentUrl={artworkUrl}
                currentFileName={artworkFileName}
              />
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="mt-6 w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
            {selection && (
              <span className="text-primary-200 ml-1">
                — {formatPrice(selection.price)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs: Description + Specs */}
      <div className="mt-12 border-t pt-8">
        <div className="flex gap-6 border-b mb-6">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === "description"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === "specs"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Specifications
          </button>
        </div>

        {activeTab === "description" && (
          <div className="prose prose-sm max-w-none text-gray-600">
            {product.description.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

        {activeTab === "specs" && (
          <div className="max-w-lg">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 text-gray-500 pr-4">Category</td>
                  <td className="py-2 font-medium text-gray-900">
                    {product.category.name}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500 pr-4">Turnaround</td>
                  <td className="py-2 font-medium text-gray-900">
                    {product.turnaroundDays} working days
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500 pr-4">Artwork</td>
                  <td className="py-2 font-medium text-gray-900">
                    {product.artworkRequired ? "Required" : "Optional"}
                  </td>
                </tr>
                {product.variants.length > 0 && (
                  <>
                    <tr>
                      <td className="py-2 text-gray-500 pr-4">
                        Available Sizes
                      </td>
                      <td className="py-2 font-medium text-gray-900">
                        {[
                          ...new Set(product.variants.map((v) => v.size)),
                        ].join(", ")}
                      </td>
                    </tr>
                    {[
                      ...new Set(
                        product.variants
                          .filter((v) => v.material)
                          .map((v) => v.material)
                      ),
                    ].length > 0 && (
                      <tr>
                        <td className="py-2 text-gray-500 pr-4">Materials</td>
                        <td className="py-2 font-medium text-gray-900">
                          {[
                            ...new Set(
                              product.variants
                                .filter((v) => v.material)
                                .map((v) => v.material)
                            ),
                          ].join(", ")}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
