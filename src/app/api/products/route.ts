import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured") === "true";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { visible: true };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (featured) {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      slug,
      description,
      shortDescription,
      categoryId,
      images,
      basePrice,
      variants,
      artworkRequired,
      artworkTemplate,
      artworkInstructions,
      turnaroundDays,
      featured,
      visible,
    } = await req.json();

    if (!name || !slug || !description || !categoryId || basePrice == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        categoryId,
        images: images || [],
        basePrice,
        artworkRequired: artworkRequired ?? true,
        artworkTemplate,
        artworkInstructions,
        turnaroundDays: turnaroundDays ?? 5,
        featured: featured ?? false,
        visible: visible ?? true,
        variants: variants?.length
          ? {
              create: variants.map(
                (v: {
                  size: string;
                  material?: string;
                  finish?: string;
                  quantity: number;
                  price: number;
                }) => ({
                  size: v.size,
                  material: v.material,
                  finish: v.finish,
                  quantity: v.quantity,
                  price: v.price,
                })
              ),
            }
          : undefined,
      },
      include: { variants: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
