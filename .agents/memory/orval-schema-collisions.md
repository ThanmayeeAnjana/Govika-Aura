---
name: Orval schema name collisions
description: Why codegen can throw TS2308 ambiguous export errors and how to fix it
---

When an OpenAPI `components.schemas` name matches (or closely mirrors) the name Orval auto-derives internally for a request/response type of some operation, the generated `@workspace/api-zod` barrel file re-exports two members with the same name, causing `tsc --build` to fail with `TS2308: Module "./generated/api" has already exported a member named 'X'`.

**Why:** Observed concretely with a schema named `RequestUploadUrlResponse` for the `requestUploadUrl` operation — Orval's own generated response type name collided with the explicit schema name.

**How to apply:** If codegen (`pnpm --filter @workspace/api-spec run codegen`) fails with TS2308 after adding/renaming an OpenAPI schema, rename the colliding schema in `openapi.yaml` to something less generic (e.g. prefix or suffix distinctly, like `UploadUrlResponse` instead of `RequestUploadUrlResponse`) and re-run codegen.
