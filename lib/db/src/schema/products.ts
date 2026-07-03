import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productCategoryEnum = pgEnum("product_category", [
  "saree",
  "kurti",
  "puja",
  "decor",
]);

export const stockStatusEnum = pgEnum("stock_status", [
  "in_stock",
  "made_to_order",
]);

export const productVariantSchema = z.object({
  label: z.string(),
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});
export type ProductVariant = z.infer<typeof productVariantSchema>;

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: productCategoryEnum("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull().default(""),
  photos: jsonb("photos").$type<string[]>().notNull().default([]),
  variants: jsonb("variants").$type<ProductVariant[]>().notNull().default([]),
  stockStatus: stockStatusEnum("stock_status").notNull().default("in_stock"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable, {
  price: z.union([z.number(), z.string()]).transform((v) => String(v)),
  photos: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).optional(),
}).omit({ id: true, createdAt: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
