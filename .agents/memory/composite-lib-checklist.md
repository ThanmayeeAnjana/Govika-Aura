---
name: New composite lib checklist
description: Required tsconfig settings when adding a new lib/* package copied from a skill template
---

When adding a new composite library under `lib/*` (e.g. copying a skill's client template like `object-storage-web`), its `tsconfig.json` must include `composite: true`, `declarationMap: true`, and `emitDeclarationOnly: true` alongside `outDir`/`rootDir`.

**Why:** Without these, any other package that lists the new lib in its `references` array fails `tsc --build` with `TS6306: Referenced project '...' must have setting "composite": true`. Skill-provided templates don't always ship with these already set, since they assume you'll follow the pnpm-workspace lib conventions yourself.

**How to apply:** Immediately after copying a new lib package from a skill template (object-storage-web, or similar) and adding it to root/consumer `tsconfig.json` references, check its own `tsconfig.json` for these three compiler options before running the workspace typecheck.
