import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentOnly = searchParams.get("parentOnly") === "true";
    const includeChildren = searchParams.get("includeChildren") === "true";
    const includeAll = searchParams.get("includeAll") === "true";

    const session = includeAll ? await getServerSession(authOptions) : null;
    const isAdmin = session?.user?.role === "ADMIN";
    const visibleFilter = includeAll && isAdmin ? {} : { visible: true };

    const where = parentOnly
      ? { parentId: null, ...visibleFilter }
      : visibleFilter;

    const categories = await prisma.category.findMany({
      where,
      include: includeChildren
        ? {
            children: {
              where: includeAll && isAdmin ? {} : { visible: true },
              orderBy: { sortOrder: "asc" },
            },
            _count: { select: { products: true } },
          }
        : {
            _count: { select: { products: true } },
          },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, description, image, parentId, sortOrder, visible } =
      await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        sortOrder: sortOrder ?? 0,
        visible: visible ?? true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
