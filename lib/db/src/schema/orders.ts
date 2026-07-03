import {
  date,
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

export const paymentMethodEnum = pgEnum("payment_method", ["upi", "cod"]);

export const orderStatusEnum = pgEnum("order_status", [
  "received",
  "packed",
  "shipped",
]);

export const orderItemSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  variantLabel: z.string().nullable().optional(),
  quantity: z.number().int().min(1),
  price: z.union([z.number(), z.string()]).transform((v) => Number(v)),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  items: jsonb("items").$type<OrderItem[]>().notNull().default([]),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  status: orderStatusEnum("status").notNull().default("received"),
  estimatedDate: date("estimated_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable, {
  items: z.array(orderItemSchema),
  subtotal: z.union([z.number(), z.string()]).transform((v) => String(v)),
  deliveryFee: z.union([z.number(), z.string()]).transform((v) => String(v)),
  total: z.union([z.number(), z.string()]).transform((v) => String(v)),
}).omit({ id: true, createdAt: true });

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
