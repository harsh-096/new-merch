import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Banner",
    slug: "banner",
    description: "Indoor and outdoor banners for every occasion",
    children: [
      { name: "Indoor Banners", slug: "indoor-banners", description: "High quality indoor banner prints" },
      { name: "Outdoor Banners", slug: "outdoor-banners", description: "Weatherproof outdoor vinyl banners" },
      { name: "Vinyl Banners", slug: "vinyl-banners", description: "Durable PVC vinyl banners" },
    ],
  },
  {
    name: "Business Cards",
    slug: "business-cards",
    description: "Professional business cards in various styles",
    children: [
      { name: "Single Sided Business Cards", slug: "single-sided-business-cards", description: "Classic single-sided business cards" },
      { name: "Double Sided Business Cards", slug: "double-sided-business-cards", description: "Premium double-sided business cards" },
    ],
  },
  {
    name: "Flyer and Leaflets",
    slug: "flyer-and-leaflets",
    description: "Flyers and leaflets for promotions and events",
    children: [
      { name: "Flyers", slug: "flyers", description: "Single-sided and double-sided flyers" },
    ],
  },
  {
    name: "Exhibition Stand",
    slug: "exhibition-stand",
    description: "Portable exhibition and display stands",
    children: [
      { name: "Exhibition Stands", slug: "exhibition-stands", description: "Professional exhibition display stands" },
    ],
  },
  {
    name: "Roller Banner",
    slug: "roller-banner",
    description: "Portable pull-up roller banner displays",
    children: [
      { name: "Roller Banners", slug: "roller-banners", description: "Retractable pull-up roller banner displays" },
    ],
  },
  {
    name: "Stationary",
    slug: "stationary",
    description: "Branded stationery and office supplies",
    children: [
      { name: "Compliment Slips", slug: "compliment-slips", description: "Professional branded compliment slips" },
      { name: "Notebooks", slug: "notebooks", description: "Custom branded notebooks" },
      { name: "Notepads", slug: "notepads", description: "Custom branded notepads" },
      { name: "Pens", slug: "pens", description: "Custom printed pens" },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`Admin user: ${adminEmail}`);

  // Clean slate
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany({});
  console.log("Cleared old data.");

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: i,
        visible: true,
      },
    });
    console.log(`Category: ${parent.name}`);

    for (let j = 0; j < cat.children.length; j++) {
      const child = cat.children[j];
      await prisma.category.create({
        data: {
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: parent.id,
          sortOrder: j,
          visible: true,
        },
      });
      console.log(`  └ ${child.name}`);
    }
  }

  console.log("\nSeeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
