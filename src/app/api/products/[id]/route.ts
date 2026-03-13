import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isSlug = !params.id.match(/^c[a-z0-9]{24}$/);

    const product = await prisma.product.findFirst({
      where: isSlug ? { slug: params.id } : { id: params.id },
      include: {
        category: { include: { parent: true } },
        variants: { orderBy: [{ size: "asc" }, { quantity: "asc" }] },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
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
    const { variants, ...productData } = data;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: productData,
    });

    if (variants) {
      await prisma.productVariant.deleteMany({
        where: { productId: params.id },
      });

      if (variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map(
            (v: {
              size: string;
              material?: string;
              finish?: string;
              quantity: number;
              price: number;
            }) => ({
              productId: params.id,
              size: v.size,
              material: v.material,
              finish: v.finish,
              quantity: v.quantity,
              price: v.price,
            })
          ),
        });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { variants: true, category: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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

    await prisma.productVariant.deleteMany({ where: { productId: params.id } });
    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
