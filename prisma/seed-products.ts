import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const FOLDER = process.env.STORAGE_FOLDER || "new-merch";

if (!CLOUD) {
  throw new Error("CLOUDINARY_CLOUD_NAME env variable is required for seeding");
}

function img(path: string): string {
  const encoded = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${FOLDER}/${encoded}`;
}

const products = [
  {
    name: "Vinyl Banner",
    slug: "vinyl-banner",
    description:
      "High-quality PVC vinyl banners perfect for outdoor advertising, events, and promotions. Printed in full colour on durable 440gsm PVC material with hemmed edges and eyelets included. Weatherproof and UV resistant for long-lasting outdoor use.",
    shortDescription: "Durable PVC banners for indoor and outdoor use",
    categorySlug: "vinyl-banners",
    images: [
      img("Banner/Vinyl Banners/BAN001A"),
      img("Banner/Vinyl Banners/BAN001B"),
      img("Banner/Vinyl Banners/BAN001C"),
    ],
    basePrice: 24.99,
    artworkInstructions:
      "## How to Create Your Banner Artwork\n\n1. Set up your document at the exact banner size plus 3mm bleed on all sides\n2. Use 150 DPI resolution (minimum) for large format\n3. Use CMYK colour mode\n4. Keep important text/logos at least 10mm from the trim edge\n5. Supply as a high-resolution PDF\n6. Outline all fonts",
    turnaroundDays: 3,
    featured: true,
    variants: [
      { size: "610mm x 1220mm", material: "440gsm PVC", finish: "Matt", quantity: 1, price: 24.99 },
      { size: "610mm x 1220mm", material: "440gsm PVC", finish: "Matt", quantity: 2, price: 44.99 },
      { size: "914mm x 1830mm", material: "440gsm PVC", finish: "Matt", quantity: 1, price: 39.99 },
      { size: "914mm x 1830mm", material: "440gsm PVC", finish: "Matt", quantity: 2, price: 69.99 },
      { size: "1220mm x 2440mm", material: "440gsm PVC", finish: "Matt", quantity: 1, price: 54.99 },
      { size: "1220mm x 2440mm", material: "440gsm PVC", finish: "Matt", quantity: 2, price: 99.99 },
      { size: "1220mm x 3660mm", material: "440gsm PVC", finish: "Matt", quantity: 1, price: 74.99 },
    ],
  },
  {
    name: "Indoor Banner",
    slug: "indoor-banner",
    description:
      "Premium quality indoor banners printed on smooth PVC or fabric material. Ideal for retail displays, exhibitions, and indoor events. Crisp, vibrant full-colour printing with optional eyelets or pole pockets.",
    shortDescription: "High quality banners for indoor display",
    categorySlug: "indoor-banners",
    images: [
      img("Banner/Vinyl Banners/BAN001A"),
      img("Banner/Vinyl Banners/BAN001B"),
    ],
    basePrice: 19.99,
    artworkInstructions:
      "## Indoor Banner Artwork Guide\n\n1. Set up your document at the exact banner size plus 3mm bleed\n2. Use 150 DPI resolution minimum\n3. Use CMYK colour mode\n4. Keep important content at least 10mm from edges\n5. Supply as high-resolution PDF\n6. Outline all fonts",
    turnaroundDays: 3,
    featured: false,
    variants: [
      { size: "610mm x 914mm", material: "PVC", finish: "Matt", quantity: 1, price: 19.99 },
      { size: "610mm x 1220mm", material: "PVC", finish: "Matt", quantity: 1, price: 24.99 },
      { size: "914mm x 1830mm", material: "PVC", finish: "Matt", quantity: 1, price: 34.99 },
      { size: "610mm x 1220mm", material: "Fabric", finish: "Satin", quantity: 1, price: 29.99 },
      { size: "914mm x 1830mm", material: "Fabric", finish: "Satin", quantity: 1, price: 44.99 },
    ],
  },
  {
    name: "Outdoor Banner",
    slug: "outdoor-banner",
    description:
      "Weatherproof outdoor banners built to withstand the elements. Printed on heavy-duty 510gsm PVC with reinforced hems and rust-proof eyelets. UV resistant inks ensure colours stay vibrant in sun and rain.",
    shortDescription: "Heavy-duty weatherproof outdoor banners",
    categorySlug: "outdoor-banners",
    images: [
      img("Banner/Vinyl Banners/BAN001A"),
      img("Banner/Vinyl Banners/BAN001C"),
    ],
    basePrice: 29.99,
    artworkInstructions:
      "## Outdoor Banner Artwork Guide\n\n1. Set up at the exact banner size plus 5mm bleed\n2. Use 150 DPI resolution minimum for large format\n3. Use CMYK colour mode\n4. Keep text at least 15mm from the edge for hemming\n5. Supply as high-resolution PDF\n6. Outline all fonts",
    turnaroundDays: 3,
    featured: false,
    variants: [
      { size: "914mm x 1830mm", material: "510gsm PVC", finish: "Matt", quantity: 1, price: 29.99 },
      { size: "1220mm x 2440mm", material: "510gsm PVC", finish: "Matt", quantity: 1, price: 49.99 },
      { size: "1220mm x 3660mm", material: "510gsm PVC", finish: "Matt", quantity: 1, price: 69.99 },
      { size: "1830mm x 3660mm", material: "510gsm PVC", finish: "Matt", quantity: 1, price: 99.99 },
      { size: "914mm x 3050mm", material: "Mesh PVC", finish: "Matt", quantity: 1, price: 39.99 },
    ],
  },
  {
    name: "Single Sided Business Card",
    slug: "single-sided-business-card",
    description:
      "Classic single-sided business cards on premium 400gsm silk card. Clean, professional look with your details printed on one side. Available with matt or gloss lamination for a polished finish.",
    shortDescription: "Professional single-sided business cards",
    categorySlug: "single-sided-business-cards",
    images: [
      img("Business Cards/Single Sided Business Cards/BSC001A"),
      img("Business Cards/Single Sided Business Cards/BSC001B"),
    ],
    basePrice: 12.99,
    artworkInstructions:
      "## Business Card Artwork Guide\n\n1. Document size: 91mm x 61mm (includes 3mm bleed)\n2. Finished size: 85mm x 55mm\n3. Safe area: keep text 5mm from the trim edge\n4. Resolution: 300 DPI minimum\n5. Colour: CMYK\n6. Supply as a single-page PDF\n7. Outline all fonts",
    turnaroundDays: 3,
    featured: true,
    variants: [
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Matt Laminated", quantity: 100, price: 12.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Matt Laminated", quantity: 250, price: 19.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Matt Laminated", quantity: 500, price: 29.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Gloss Laminated", quantity: 100, price: 12.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Gloss Laminated", quantity: 250, price: 19.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Gloss Laminated", quantity: 500, price: 29.99 },
      { size: "85mm x 55mm", material: "400gsm Uncoated", finish: "None", quantity: 250, price: 17.99 },
    ],
  },
  {
    name: "Double Sided Business Card",
    slug: "double-sided-business-card",
    description:
      "Premium double-sided business cards with full colour printing on both sides. Make a lasting impression with your branding on the front and contact details on the back. Printed on thick 400gsm silk card.",
    shortDescription: "Premium double-sided business cards",
    categorySlug: "double-sided-business-cards",
    images: [
      img("Business Cards/Single Sided Business Cards/BSC001A"),
      img("Business Cards/Single Sided Business Cards/BSC001B"),
    ],
    basePrice: 15.99,
    artworkInstructions:
      "## Double Sided Business Card Guide\n\n1. Document size: 91mm x 61mm (includes 3mm bleed)\n2. Finished size: 85mm x 55mm\n3. Safe area: keep text 5mm from the trim edge\n4. Resolution: 300 DPI minimum\n5. Colour: CMYK\n6. Supply front and back as pages 1 and 2 in one PDF\n7. Outline all fonts",
    turnaroundDays: 3,
    featured: true,
    variants: [
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Matt Laminated", quantity: 100, price: 15.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Matt Laminated", quantity: 250, price: 22.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Matt Laminated", quantity: 500, price: 34.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Gloss Laminated", quantity: 100, price: 15.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Gloss Laminated", quantity: 250, price: 22.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Gloss Laminated", quantity: 500, price: 34.99 },
      { size: "85mm x 55mm", material: "400gsm Silk", finish: "Gloss Laminated", quantity: 1000, price: 49.99 },
      { size: "85mm x 55mm", material: "400gsm Uncoated", finish: "None", quantity: 250, price: 19.99 },
    ],
  },
  {
    name: "Flyer",
    slug: "flyer",
    description:
      "Eye-catching flyers for promotions, events, and marketing campaigns. Printed in full colour on premium silk or uncoated stock. Single or double-sided options available. Ideal for handouts, inserts, and direct mail.",
    shortDescription: "Full colour promotional flyers",
    categorySlug: "flyers",
    images: [
      img("Flyer and Leaflets/Flyers/FL001A"),
      img("Flyer and Leaflets/Flyers/FL001B"),
    ],
    basePrice: 19.99,
    artworkInstructions:
      "## Flyer Artwork Guide\n\n1. Set up at the finished size plus 3mm bleed on all sides\n2. A5: 154mm x 216mm / A4: 216mm x 303mm (with bleed)\n3. Safe area: keep text 5mm from trim edge\n4. Resolution: 300 DPI, CMYK\n5. For double-sided, supply front and back as pages 1 and 2\n6. Outline all fonts",
    turnaroundDays: 3,
    featured: true,
    variants: [
      { size: "148mm x 210mm (A5)", material: "170gsm Silk", finish: "None", quantity: 100, price: 19.99 },
      { size: "148mm x 210mm (A5)", material: "170gsm Silk", finish: "None", quantity: 250, price: 29.99 },
      { size: "148mm x 210mm (A5)", material: "170gsm Silk", finish: "None", quantity: 500, price: 39.99 },
      { size: "148mm x 210mm (A5)", material: "170gsm Silk", finish: "None", quantity: 1000, price: 54.99 },
      { size: "210mm x 297mm (A4)", material: "170gsm Silk", finish: "None", quantity: 100, price: 29.99 },
      { size: "210mm x 297mm (A4)", material: "170gsm Silk", finish: "None", quantity: 250, price: 39.99 },
      { size: "210mm x 297mm (A4)", material: "170gsm Silk", finish: "None", quantity: 500, price: 59.99 },
      { size: "148mm x 210mm (A5)", material: "350gsm Silk", finish: "Matt Laminated", quantity: 250, price: 49.99 },
    ],
  },
  {
    name: "Exhibition Stand",
    slug: "exhibition-stand-product",
    description:
      "Professional exhibition display stands for trade shows, conferences, and events. Lightweight yet sturdy aluminium frames with high-quality printed graphics. Easy to assemble with no tools required. Includes carry case.",
    shortDescription: "Portable exhibition display stands",
    categorySlug: "exhibition-stands",
    images: [img("Exhibition Stand/Exhibition Stands/EX001")],
    basePrice: 149.99,
    artworkInstructions:
      "## Exhibition Stand Artwork Guide\n\n1. Download the template for your chosen stand size\n2. Set up artwork at 150 DPI at full size\n3. Use CMYK colour mode\n4. Include 20mm bleed on all sides\n5. Keep important content 50mm from edges\n6. Supply as high-resolution PDF\n7. Outline all fonts",
    turnaroundDays: 5,
    featured: true,
    variants: [
      { size: "2280mm x 2280mm (3x3)", material: "PVC Graphic", finish: "Matt", quantity: 1, price: 349.99 },
      { size: "2280mm x 2280mm (3x3)", material: "Fabric Graphic", finish: "Satin", quantity: 1, price: 399.99 },
      { size: "2280mm x 1520mm (3x2)", material: "PVC Graphic", finish: "Matt", quantity: 1, price: 299.99 },
      { size: "2400mm x 2400mm", material: "Fabric", finish: "Satin", quantity: 1, price: 249.99 },
      { size: "2400mm x 2400mm (curved)", material: "Fabric", finish: "Satin", quantity: 1, price: 279.99 },
      { size: "2000mm x 2000mm", material: "PVC Graphic", finish: "Matt", quantity: 1, price: 149.99 },
    ],
  },
  {
    name: "Roller Banner",
    slug: "roller-banner-product",
    description:
      "Portable pull-up roller banners for exhibitions, trade shows, and events. Includes an aluminium base, retractable mechanism, support pole, and carry bag. Quick and easy setup in seconds with no tools required.",
    shortDescription: "Portable pull-up display banners",
    categorySlug: "roller-banners",
    images: [
      img("Roller Banner/Roller Banners/RB001A"),
      img("Roller Banner/Roller Banners/RB001B"),
      img("Roller Banner/Roller Banners/RB001C"),
      img("Roller Banner/Roller Banners/RB001D"),
    ],
    basePrice: 29.99,
    artworkInstructions:
      "## Roller Banner Artwork Guide\n\n1. Standard size: 800mm x 2000mm or 850mm x 2000mm\n2. Add 50mm to the bottom for the area that tucks into the base\n3. Resolution: 150 DPI at full size\n4. Colour: CMYK\n5. Important content should be at eye level (900mm-1700mm from bottom)\n6. Export as high-resolution PDF",
    turnaroundDays: 3,
    featured: true,
    variants: [
      { size: "800mm x 2000mm", material: "Banner Vinyl", finish: "Matt", quantity: 1, price: 29.99 },
      { size: "800mm x 2000mm", material: "Banner Vinyl", finish: "Matt", quantity: 2, price: 54.99 },
      { size: "850mm x 2000mm", material: "Banner Vinyl", finish: "Matt", quantity: 1, price: 34.99 },
      { size: "850mm x 2000mm", material: "Banner Vinyl", finish: "Matt", quantity: 2, price: 64.99 },
      { size: "1000mm x 2000mm", material: "Banner Vinyl", finish: "Matt", quantity: 1, price: 44.99 },
      { size: "1200mm x 2000mm", material: "Banner Vinyl", finish: "Matt", quantity: 1, price: 54.99 },
    ],
  },
  {
    name: "Branded Pen",
    slug: "branded-pen",
    description:
      "Custom printed pens — one of the most effective promotional products. High quality ballpoint pens with your logo and branding printed directly onto the barrel. Available in a range of colours.",
    shortDescription: "Custom logo printed ballpoint pens",
    categorySlug: "pens",
    images: [
      img("Stationary/Pens/PEN001A"),
      img("Stationary/Pens/PEN001B"),
      img("Stationary/Pens/PEN001C"),
      img("Stationary/Pens/PEN001D"),
      img("Stationary/Pens/PEN001E"),
    ],
    basePrice: 49.99,
    artworkInstructions:
      "## Pen Artwork Guide\n\n1. Print area: approximately 50mm x 7mm (varies by pen model)\n2. Supply artwork as a vector file (AI, EPS, or PDF)\n3. Maximum 4 spot colours, or full colour CMYK\n4. Keep design simple for best results at small sizes\n5. Outline all fonts",
    turnaroundDays: 7,
    featured: false,
    variants: [
      { size: "50mm x 7mm print area", material: "Plastic", finish: "1 Colour Print", quantity: 100, price: 49.99 },
      { size: "50mm x 7mm print area", material: "Plastic", finish: "1 Colour Print", quantity: 250, price: 89.99 },
      { size: "50mm x 7mm print area", material: "Plastic", finish: "1 Colour Print", quantity: 500, price: 149.99 },
      { size: "50mm x 7mm print area", material: "Plastic", finish: "Full Colour Print", quantity: 100, price: 69.99 },
      { size: "50mm x 7mm print area", material: "Plastic", finish: "Full Colour Print", quantity: 250, price: 119.99 },
      { size: "50mm x 7mm print area", material: "Metal", finish: "Engraved", quantity: 50, price: 124.99 },
      { size: "50mm x 7mm print area", material: "Metal", finish: "Engraved", quantity: 100, price: 199.99 },
    ],
  },
  {
    name: "Compliment Slip",
    slug: "compliment-slip",
    description:
      "Professional branded compliment slips printed on quality stock. The perfect addition to your business stationery set. Standard DL size (210mm x 99mm) with full colour printing.",
    shortDescription: "Branded compliment slips for business",
    categorySlug: "compliment-slips",
    images: [img("Stationary/Compliment Slips/CS001")],
    basePrice: 19.99,
    artworkInstructions:
      "## Compliment Slip Artwork Guide\n\n1. Finished size: 210mm x 99mm (DL)\n2. Include 3mm bleed on all sides\n3. Resolution: 300 DPI, CMYK\n4. Keep text 5mm from trim edge\n5. Supply as PDF\n6. Outline all fonts",
    turnaroundDays: 3,
    featured: false,
    variants: [
      { size: "210mm x 99mm (DL)", material: "120gsm Uncoated", finish: "None", quantity: 100, price: 19.99 },
      { size: "210mm x 99mm (DL)", material: "120gsm Uncoated", finish: "None", quantity: 250, price: 29.99 },
      { size: "210mm x 99mm (DL)", material: "120gsm Uncoated", finish: "None", quantity: 500, price: 44.99 },
      { size: "210mm x 99mm (DL)", material: "170gsm Silk", finish: "None", quantity: 250, price: 34.99 },
    ],
  },
  {
    name: "Custom Notebook",
    slug: "custom-notebook",
    description:
      "Premium custom branded notebooks with your logo on the cover. Perfect for corporate gifts, events, and retail. Soft-touch or hardback covers with quality lined or blank pages inside.",
    shortDescription: "Branded custom notebooks",
    categorySlug: "notebooks",
    images: [img("Stationary/Notebooks/NB001")],
    basePrice: 124.99,
    artworkInstructions:
      "## Notebook Artwork Guide\n\n1. Cover size: A5 (154mm x 216mm with bleed) or A4 (216mm x 303mm with bleed)\n2. Include 3mm bleed and 5mm safe area\n3. Resolution: 300 DPI, CMYK\n4. Supply front cover, back cover, and spine as a single spread PDF\n5. Outline all fonts",
    turnaroundDays: 10,
    featured: false,
    variants: [
      { size: "148mm x 210mm (A5)", material: "Softback", finish: "Matt Laminated", quantity: 25, price: 124.99 },
      { size: "148mm x 210mm (A5)", material: "Softback", finish: "Matt Laminated", quantity: 50, price: 199.99 },
      { size: "148mm x 210mm (A5)", material: "Hardback", finish: "Matt Laminated", quantity: 25, price: 174.99 },
      { size: "148mm x 210mm (A5)", material: "Hardback", finish: "Matt Laminated", quantity: 50, price: 279.99 },
      { size: "210mm x 297mm (A4)", material: "Softback", finish: "Matt Laminated", quantity: 25, price: 149.99 },
    ],
  },
  {
    name: "Custom Notepad",
    slug: "custom-notepad",
    description:
      "Branded notepads with your logo and design. Glued at the top or side for easy tear-off pages. Available in A4, A5, and DL sizes with 25, 50, or 100 sheets.",
    shortDescription: "Branded tear-off notepads",
    categorySlug: "notepads",
    images: [img("Stationary/Notepads/NP001")],
    basePrice: 49.99,
    artworkInstructions:
      "## Notepad Artwork Guide\n\n1. Set up at the finished pad size plus 3mm bleed\n2. Design a single page — it will be repeated for all sheets\n3. Resolution: 300 DPI, CMYK\n4. Keep text 5mm from trim edge\n5. Supply as PDF\n6. Outline all fonts",
    turnaroundDays: 5,
    featured: false,
    variants: [
      { size: "148mm x 210mm (A5, 25 sheets)", material: "80gsm Uncoated", finish: "None", quantity: 25, price: 49.99 },
      { size: "148mm x 210mm (A5, 50 sheets)", material: "80gsm Uncoated", finish: "None", quantity: 25, price: 69.99 },
      { size: "210mm x 297mm (A4, 25 sheets)", material: "80gsm Uncoated", finish: "None", quantity: 25, price: 69.99 },
      { size: "210mm x 297mm (A4, 50 sheets)", material: "80gsm Uncoated", finish: "None", quantity: 25, price: 89.99 },
      { size: "99mm x 210mm (DL, 50 sheets)", material: "80gsm Uncoated", finish: "None", quantity: 50, price: 79.99 },
    ],
  },
];

async function main() {
  console.log("Seeding products...\n");

  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("Cleared existing products.\n");

  for (const p of products) {
    const category = await prisma.category.findUnique({
      where: { slug: p.categorySlug },
    });

    if (!category) {
      console.log(
        `  SKIP: category "${p.categorySlug}" not found for "${p.name}"`
      );
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        categoryId: category.id,
        images: p.images,
        basePrice: p.basePrice,
        artworkRequired: true,
        artworkInstructions: p.artworkInstructions,
        turnaroundDays: p.turnaroundDays,
        featured: p.featured,
        visible: true,
        variants: {
          create: p.variants,
        },
      },
    });

    console.log(
      `  OK: ${product.name} (${p.variants.length} variants) → ${category.name}`
    );
  }

  console.log("\nProduct seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
