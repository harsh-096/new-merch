"use client";

import { useState, useMemo, useEffect } from "react";
import { Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface Variant {
  id: string;
  size: string;
  material: string | null;
  finish: string | null;
  quantity: number;
  price: number;
}

interface ProductConfiguratorProps {
  variants: Variant[];
  basePrice: number;
  onSelectionChange: (selection: {
    variantId?: string;
    size: string;
    material?: string;
    finish?: string;
    quantity: number;
    price: number;
  }) => void;
}

export default function ProductConfigurator({
  variants,
  basePrice,
  onSelectionChange,
}: ProductConfiguratorProps) {
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size))],
    [variants]
  );

  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");

  const materialsForSize = useMemo(
    () => [
      ...new Set(
        variants
          .filter((v) => v.size === selectedSize && v.material)
          .map((v) => v.material!)
      ),
    ],
    [variants, selectedSize]
  );

  const [selectedMaterial, setSelectedMaterial] = useState(
    materialsForSize[0] || ""
  );

  const finishesForSelection = useMemo(
    () => [
      ...new Set(
        variants
          .filter(
            (v) =>
              v.size === selectedSize &&
              (!v.material || v.material === selectedMaterial) &&
              v.finish
          )
          .map((v) => v.finish!)
      ),
    ],
    [variants, selectedSize, selectedMaterial]
  );

  const [selectedFinish, setSelectedFinish] = useState(
    finishesForSelection[0] || ""
  );

  const quantitiesForSelection = useMemo(
    () =>
      variants
        .filter(
          (v) =>
            v.size === selectedSize &&
            (!v.material || v.material === selectedMaterial) &&
            (!v.finish || v.finish === selectedFinish)
        )
        .map((v) => ({ quantity: v.quantity, price: v.price, id: v.id }))
        .sort((a, b) => a.quantity - b.quantity),
    [variants, selectedSize, selectedMaterial, selectedFinish]
  );

  const [selectedQtyIndex, setSelectedQtyIndex] = useState(0);

  useEffect(() => {
    setSelectedMaterial(materialsForSize[0] || "");
  }, [materialsForSize]);

  useEffect(() => {
    setSelectedFinish(finishesForSelection[0] || "");
  }, [finishesForSelection]);

  useEffect(() => {
    setSelectedQtyIndex(0);
  }, [quantitiesForSelection]);

  useEffect(() => {
    const qty = quantitiesForSelection[selectedQtyIndex];
    if (qty) {
      onSelectionChange({
        variantId: qty.id,
        size: selectedSize,
        material: selectedMaterial || undefined,
        finish: selectedFinish || undefined,
        quantity: qty.quantity,
        price: qty.price,
      });
    } else {
      onSelectionChange({
        size: selectedSize || "Standard",
        quantity: 1,
        price: basePrice,
      });
    }
  }, [
    selectedSize,
    selectedMaterial,
    selectedFinish,
    selectedQtyIndex,
    quantitiesForSelection,
    basePrice,
    onSelectionChange,
  ]);

  if (variants.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500">Standard product</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {formatPrice(basePrice)}
        </p>
      </div>
    );
  }

  const currentPrice =
    quantitiesForSelection[selectedQtyIndex]?.price || basePrice;

  return (
    <div className="space-y-5">
      {/* Step 1: Size */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            1. Select Size
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "px-4 py-2 border rounded-lg text-sm font-medium transition",
                  selectedSize === size
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {selectedSize === size && (
                  <Check className="w-3 h-3 inline mr-1" />
                )}
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Material */}
      {materialsForSize.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            2. Select Material
          </label>
          <div className="flex flex-wrap gap-2">
            {materialsForSize.map((mat) => (
              <button
                key={mat}
                type="button"
                onClick={() => setSelectedMaterial(mat)}
                className={cn(
                  "px-4 py-2 border rounded-lg text-sm font-medium transition",
                  selectedMaterial === mat
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {selectedMaterial === mat && (
                  <Check className="w-3 h-3 inline mr-1" />
                )}
                {mat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Finish */}
      {finishesForSelection.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {materialsForSize.length > 0 ? "3" : "2"}. Select Finish
          </label>
          <div className="flex flex-wrap gap-2">
            {finishesForSelection.map((finish) => (
              <button
                key={finish}
                type="button"
                onClick={() => setSelectedFinish(finish)}
                className={cn(
                  "px-4 py-2 border rounded-lg text-sm font-medium transition",
                  selectedFinish === finish
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {selectedFinish === finish && (
                  <Check className="w-3 h-3 inline mr-1" />
                )}
                {finish}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Quantity */}
      {quantitiesForSelection.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {materialsForSize.length > 0 && finishesForSelection.length > 0
              ? "4"
              : materialsForSize.length > 0 || finishesForSelection.length > 0
                ? "3"
                : "2"}
            . Select Quantity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quantitiesForSelection.map((opt, i) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedQtyIndex(i)}
                className={cn(
                  "p-3 border rounded-lg text-left transition",
                  selectedQtyIndex === i
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {opt.quantity} {opt.quantity === 1 ? "unit" : "units"}
                </p>
                <p className="text-sm font-bold text-primary-600">
                  {formatPrice(opt.price)}
                </p>
                {opt.quantity > 1 && (
                  <p className="text-xs text-gray-400">
                    {formatPrice(opt.price / opt.quantity)} each
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Your price</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatPrice(currentPrice)}
          </p>
        </div>
        {quantitiesForSelection[selectedQtyIndex]?.quantity > 1 && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Per unit</p>
            <p className="text-sm font-semibold text-gray-600">
              {formatPrice(
                currentPrice /
                  quantitiesForSelection[selectedQtyIndex].quantity
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
