import { Router, type IRouter } from "express";
import { eq, desc, inArray } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import { CreateOrderBody, UpdateOrderStatusBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

const DELIVERY_FEE = 0;

function serializeOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    customerName: o.customerName,
    phone: o.phone,
    address: o.address,
    items: o.items,
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
    paymentMethod: o.paymentMethod,
    status: o.status,
    estimatedDate: o.estimatedDate,
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/orders", requireAdmin, async (req, res) => {
  const { status } = req.query;

  const rows = await db
    .select()
    .from(ordersTable)
    .where(typeof status === "string" ? eq(ordersTable.status, status as (typeof ordersTable.status.enumValues)[number]) : undefined)
    .orderBy(desc(ordersTable.createdAt));

  res.json(rows.map(serializeOrder));
});

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order data" });
    return;
  }

  const productIds = [...new Set(parsed.data.items.map((item) => item.productId))];
  const products = await db.select().from(productsTable).where(inArray(productsTable.id, productIds));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const missing = productIds.find((id) => !productMap.has(id));
  if (missing !== undefined) {
    res.status(400).json({ error: `Product ${missing} not found` });
    return;
  }

  const items = parsed.data.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error("unreachable");
    }
    return {
      productId: product.id,
      productName: product.name,
      variantLabel: item.variantLabel ?? null,
      quantity: item.quantity,
      price: Number(product.price),
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  const [created] = await db
    .insert(ordersTable)
    .values({
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      items,
      subtotal: String(subtotal),
      deliveryFee: String(DELIVERY_FEE),
      total: String(total),
      paymentMethod: parsed.data.paymentMethod,
      status: "received",
    })
    .returning();

  if (!created) {
    res.status(500).json({ error: "Failed to create order" });
    return;
  }

  res.status(201).json(serializeOrder(created));
});

router.get("/orders/summary", requireAdmin, async (_req, res) => {
  const rows = await db.select({ status: ordersTable.status }).from(ordersTable);
  const summary = { received: 0, packed: 0, shipped: 0, total: rows.length };
  for (const row of rows) {
    summary[row.status] += 1;
  }
  res.json(summary);
});

router.get("/orders/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

router.patch("/orders/:id/status", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(updated));
});

export default router;
