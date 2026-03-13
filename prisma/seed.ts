import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Banners",
    slug: "banners",
    description: "Indoor and outdoor banners for every occasion",
    children: [
      { name: "Indoor Banners", slug: "indoor-banners", description: "High quality indoor banner prints" },
      { name: "Outdoor Banners", slug: "outdoor-banners", description: "Weatherproof outdoor vinyl banners" },
      { name: "Vinyl Banners", slug: "vinyl-banners", description: "Durable PVC vinyl banners" },
    ],
  },
  {
    name: "Roller Banners",
    slug: "roller-banners",
    description: "Portable pull-up roller banner displays",
    children: [
      { name: "Economy Roller Banners", slug: "economy-roller-banners", description: "Budget-friendly roller banners" },
      { name: "Standard Roller Banners", slug: "standard-roller-banners", description: "All-purpose roller banners" },
      { name: "Premium Roller Banners", slug: "premium-roller-banners", description: "High-end roller banners" },
      { name: "Wide Roller Banners", slug: "wide-roller-banners", description: "Extra-wide roller banners" },
    ],
  },
  {
    name: "Business Cards",
    slug: "business-cards",
    description: "Professional business cards in various styles",
    children: [
      { name: "Standard Business Cards", slug: "standard-business-cards", description: "Classic business cards" },
      { name: "Folded Business Cards", slug: "folded-business-cards", description: "Folded business cards with extra space" },
      { name: "Spot UV Business Cards", slug: "spot-uv-business-cards", description: "Premium spot UV finish cards" },
      { name: "Rounded Corner Cards", slug: "rounded-corner-cards", description: "Business cards with rounded corners" },
    ],
  },
  {
    name: "Flyers & Leaflets",
    slug: "flyers-leaflets",
    description: "Flyers and leaflets for promotions and events",
    children: [
      { name: "Flyers", slug: "flyers", description: "Single-sided and double-sided flyers" },
      { name: "Folded Leaflets", slug: "folded-leaflets", description: "Half-fold, tri-fold, and z-fold leaflets" },
      { name: "Door Hangers", slug: "door-hangers", description: "Custom printed door hangers" },
    ],
  },
  {
    name: "Posters",
    slug: "posters",
    description: "Indoor and outdoor posters in all sizes",
    children: [
      { name: "Indoor Posters", slug: "indoor-posters", description: "High quality indoor poster prints" },
      { name: "Outdoor Posters", slug: "outdoor-posters", description: "Weatherproof outdoor posters" },
    ],
  },
  {
    name: "Brochures",
    slug: "brochures",
    description: "Professional brochures and booklets",
    children: [
      { name: "Saddle Stitched Brochures", slug: "saddle-stitched-brochures", description: "Staple-bound brochures" },
      { name: "Perfect Bound Brochures", slug: "perfect-bound-brochures", description: "Spine-glued brochures" },
    ],
  },
  {
    name: "Stationery",
    slug: "stationery",
    description: "Letterheads, compliment slips, and office stationery",
    children: [
      { name: "Letterheads", slug: "letterheads", description: "Custom printed letterheads" },
      { name: "Compliment Slips", slug: "compliment-slips", description: "Professional compliment slips" },
      { name: "Notepads", slug: "notepads", description: "Branded notepads" },
      { name: "Envelopes", slug: "envelopes", description: "Printed envelopes" },
    ],
  },
  {
    name: "Packaging",
    slug: "packaging",
    description: "Custom packaging boxes and solutions",
    children: [
      { name: "Boxes", slug: "packaging-boxes", description: "Custom printed packaging boxes" },
      { name: "Mailer Boxes", slug: "mailer-boxes", description: "Branded mailer boxes" },
      { name: "Product Boxes", slug: "product-boxes", description: "Custom product packaging" },
    ],
  },
  {
    name: "Stickers & Labels",
    slug: "stickers-labels",
    description: "Custom stickers and labels in all shapes and sizes",
    children: [
      { name: "Sheet Stickers", slug: "sheet-stickers", description: "Cut-to-shape stickers on sheets" },
      { name: "Roll Labels", slug: "roll-labels", description: "Labels on rolls for high volume" },
      { name: "Floor Stickers", slug: "floor-stickers", description: "Durable floor graphics" },
    ],
  },
  {
    name: "T-Shirts & Apparel",
    slug: "tshirts-apparel",
    description: "Custom printed clothing and apparel",
    children: [
      { name: "T-Shirts", slug: "t-shirts", description: "Custom printed t-shirts" },
      { name: "Hoodies", slug: "hoodies", description: "Custom printed hoodies" },
      { name: "Polo Shirts", slug: "polo-shirts", description: "Branded polo shirts" },
    ],
  },
  {
    name: "Drinkware",
    slug: "drinkware",
    description: "Custom mugs, water bottles, and drinkware",
    children: [
      { name: "Mugs", slug: "mugs", description: "Custom printed mugs" },
      { name: "Water Bottles", slug: "water-bottles", description: "Branded water bottles" },
      { name: "Travel Mugs", slug: "travel-mugs", description: "Insulated travel mugs" },
    ],
  },
  {
    name: "Calendars",
    slug: "calendars",
    description: "Custom printed calendars",
    children: [
      { name: "Wall Calendars", slug: "wall-calendars", description: "Custom wall calendars" },
      { name: "Desk Calendars", slug: "desk-calendars", description: "Custom desk calendars" },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@newmerch.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${adminEmail}`);

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: i,
        visible: true,
      },
    });

    console.log(`Category created: ${parent.name}`);

    if (cat.children) {
      for (let j = 0; j < cat.children.length; j++) {
        const child = cat.children[j];
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: {},
          create: {
            name: child.name,
            slug: child.slug,
            description: child.description,
            parentId: parent.id,
            sortOrder: j,
            visible: true,
          },
        });
        console.log(`  Sub-category created: ${child.name}`);
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
