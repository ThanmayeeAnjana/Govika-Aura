import { Router, type IRouter } from "express";
import { eq, and, ilike, type SQL } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { CreateProductBody, UpdateProductBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

function serializeProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    description: p.description,
    photos: p.photos,
    variants: p.variants,
    stockStatus: p.stockStatus,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/products", async (req, res) => {
  const { category, search, includeInactive } = req.query;

  const conditions: SQL[] = [];
  if (typeof category === "string") {
    conditions.push(eq(productsTable.category, category as (typeof productsTable.category.enumValues)[number]));
  }
  if (typeof search === "string" && search.trim().length > 0) {
    conditions.push(ilike(productsTable.name, `%${search.trim()}%`));
  }
  if (includeInactive !== "true") {
    conditions.push(eq(productsTable.active, true));
  }

  const rows = await db
    .select()
    .from(productsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.createdAt);

  res.json(rows.map(serializeProduct));
});

router.post("/products", requireAdmin, async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product data" });
    return;
  }

  const [created] = await db
    .insert(productsTable)
    .values({
      name: parsed.data.name,
      category: parsed.data.category,
      price: String(parsed.data.price),
      description: parsed.data.description,
      photos: parsed.data.photos ?? [],
      variants: parsed.data.variants ?? [],
      stockStatus: parsed.data.stockStatus ?? "in_stock",
      active: parsed.data.active ?? true,
    })
    .returning();

  if (!created) {
    res.status(500).json({ error: "Failed to create product" });
    return;
  }

  res.status(201).json(serializeProduct(created));
});

router.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(serializeProduct(product));
});

router.patch("/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid product data" });
    return;
  }

  const { price, ...rest } = parsed.data;
  const [updated] = await db
    .update(productsTable)
    .set({
      ...rest,
      ...(price !== undefined ? { price: String(price) } : {}),
    })
    .where(eq(productsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(serializeProduct(updated));
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.status(204).end();
});

export default router;
