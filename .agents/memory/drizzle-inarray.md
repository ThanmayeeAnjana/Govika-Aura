---
name: Drizzle inArray for multi-id filters
description: Correct way to filter a Drizzle query by a list of IDs
---

Use `inArray(column, idsArray)` from `drizzle-orm` when matching a column against a list of values.

**Why:** Writing raw `sql\`${column} = ANY(${idsArray})\`` causes Drizzle to expand the array into separate positional parameters (`$1, $2, ...`) instead of a single array parameter, producing a malformed query and a runtime SQL error (`= ANY($1, $2)` is invalid syntax).

**How to apply:** Any time you need `WHERE col IN (...)` semantics from an array of values collected from request input (e.g. batch-fetching related rows for an order's line items), reach for `inArray` first rather than hand-rolled `sql` template literals.
