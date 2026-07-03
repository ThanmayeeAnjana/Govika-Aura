# Mom's Storefront

A mobile-friendly single-seller e-commerce app for a home-run Indian shop selling Sarees, Kurtis, Puja items, and Decor — customers browse and order via UPI or Cash on Delivery, and the seller (admin) manages products and order fulfillment from a simple dashboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/storefront run dev` — run the storefront web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, object storage vars (`DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5, session-based admin auth (`express-session`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Object storage: Replit App Storage (GCS-backed) for product photos
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the API contract (products, orders, admin auth, storage)
- `lib/db/src/schema/products.ts`, `orders.ts` — Drizzle schema (Product, Order entities)
- `artifacts/api-server/src/routes/` — `products.ts`, `orders.ts`, `admin.ts`, `storage.ts`
- `artifacts/api-server/src/lib/adminAuth.ts` — `requireAdmin` session middleware
- `artifacts/storefront/src/pages/` — customer pages (Home, Category, ProductDetail, Cart, Checkout, Order) and `admin/` (Login, Products, Orders)

## Architecture decisions

- Admin auth is a simple password gate (single admin/mom user) via `express-session` + `ADMIN_PASSWORD` secret — not Replit Auth, since there's only ever one admin.
- Cart is stored in browser localStorage, not a backend entity. Only checkout creates a real `Order` row.
- No payment gateway (paid connectors unavailable on free tier): UPI orders are marked "action required," seller follows up manually via phone/WhatsApp to share UPI QR; COD orders confirm as-is.
- No automated order notifications (no WhatsApp/email API on free tier): new orders are surfaced by visual prominence in the admin orders list instead.

## Product

- Customers: browse 4 categories (Sarees, Kurtis, Puja items, Decor), view product detail with variants/stock status, cart, checkout (UPI or COD), order confirmation with status tracking (received → packed → shipped).
- Admin (mom): password-gated dashboard to add/edit/delete products (with photo upload), and view/update order statuses.

## User preferences

_None recorded yet._

## Gotchas

- When matching multiple IDs in a Drizzle `where` clause, use `inArray(column, ids)` — NOT `sql\`${column} = ANY(${ids})\``, which incorrectly expands the array into separate positional params.
- Orval schema names can collide with its own generated helper names (e.g. a schema named `RequestUploadUrlResponse` collided with Orval's internal naming for the `requestUploadUrl` operation). Rename the OpenAPI schema if codegen throws `TS2308` ambiguous export errors.
- New composite libs added to `lib/` (e.g. `object-storage-web`) must set `composite: true` + `declarationMap` + `emitDeclarationOnly` in their `tsconfig.json`, or referencing packages fail with `TS6306`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
