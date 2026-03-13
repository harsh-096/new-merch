import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idOrSlug = params.id;

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        children: { orderBy: { sortOrder: "asc" } },
        products: {
          include: { variants: true },
          orderBy: { createdAt: "desc" },
        },
        parent: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder ?? 0,
        visible: data.visible ?? true,
      },
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const children = await prisma.category.findMany({
      where: { parentId: params.id },
      select: { id: true },
    });

    const allCatIds = [params.id, ...children.map((c) => c.id)];

    const products = await prisma.product.findMany({
      where: { categoryId: { in: allCatIds } },
      select: { id: true },
    });
    const productIds = products.map((p) => p.id);

    if (productIds.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { productId: { in: productIds } },
      });
      await prisma.product.deleteMany({
        where: { id: { in: productIds } },
      });
    }

    if (children.length > 0) {
      await prisma.category.deleteMany({
        where: { parentId: params.id },
      });
    }

    await prisma.category.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete category. It may have associated data." },
      { status: 500 }
    );
  }
}
