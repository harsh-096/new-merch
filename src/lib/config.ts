/**
 * Centralized site configuration.
 *
 * Server-only values come from process.env directly.
 * Client-safe values use NEXT_PUBLIC_ prefix and are inlined at build time.
 *
 * To change any of these for production, update your .env file -- no code changes needed.
 */

/* ── Client-safe config (available in both server and browser) ── */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "NewMerch",
  tagline:
    process.env.NEXT_PUBLIC_SITE_TAGLINE ||
    "Professional print services for businesses. From business cards to large format banners, we deliver quality printing with fast turnaround.",

  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+44 (0) 123 456 7890",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@newmerch.co.uk",
    address:
      process.env.NEXT_PUBLIC_CONTACT_ADDRESS ||
      "123 Print Street, London, UK",
  },

  promo: {
    deliveryBanner:
      process.env.NEXT_PUBLIC_DELIVERY_BANNER ||
      "Free UK delivery on orders over £50",
    dispatchNotice:
      process.env.NEXT_PUBLIC_DISPATCH_NOTICE ||
      "Same day dispatch on orders before 12pm",
    heroImage:
      process.env.NEXT_PUBLIC_HERO_IMAGE ||
      "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=1600&q=80",
  },

  locale: process.env.NEXT_PUBLIC_LOCALE || "en-GB",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "GBP",

  cartStorageKey:
    process.env.NEXT_PUBLIC_CART_STORAGE_KEY || "new-merch-cart",
} as const;

/* ── Server-only config (never exposed to the browser) ── */

export const serverConfig = {
  storage: {
    provider: (process.env.STORAGE_PROVIDER || "cloudinary") as
      | "cloudinary"
      | "s3",
    folder: process.env.STORAGE_FOLDER || "new-merch",

    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
      apiKey: process.env.CLOUDINARY_API_KEY || "",
      apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },

    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      region: process.env.AWS_REGION || "eu-west-2",
      bucket: process.env.AWS_S3_BUCKET || "",
    },
  },

  admin: {
    email: process.env.ADMIN_EMAIL || "",
    password: process.env.ADMIN_PASSWORD || "",
  },
} as const;
