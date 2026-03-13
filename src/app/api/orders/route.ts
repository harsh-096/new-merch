import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> =
      session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, addressId, notes } = await req.json();

    if (!items?.length || !addressId) {
      return NextResponse.json({ error: "Items and address are required" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        addressId,
        notes,
        totalAmount,
        items: {
          create: items.map(
            (item: {
              productId: string;
              productName: string;
              variantId?: string;
              size: string;
              material?: string;
              finish?: string;
              quantity: number;
              unitPrice: number;
              artworkUrl?: string;
            }) => ({
              productId: item.productId,
              productName: item.productName,
              variantId: item.variantId,
              size: item.size,
              material: item.material,
              finish: item.finish,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              artworkUrl: item.artworkUrl,
            })
          ),
        },
      },
      include: { items: true, address: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
