# Changelog

## 1.0.1 — fix: ESM build is no longer broken under Node 18+

The published ESM artifact (`dist/es/`) couldn't be imported under modern Node:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/dist/es/axiom-api'
  imported from …/dist/es/index.js
  Did you mean to import "../cjs/index.js"?
```

CJS was unaffected. The cause was a build-pipeline split: `vite build` produced a single bundled `dist/cjs/index.js`, but `tsc --project tsconfig.json` ran afterwards with `outDir: ./dist/es` and emitted one `.js` per source module (multi-file output), passing source import specifiers through verbatim. Two of those specifiers were extensionless (`./axiom-api`, `./config`), which Node 18+ ESM rejects per spec — there's no opt-in flag a consumer can set since `--experimental-specifier-resolution=node` was removed.

Fix in three parts:

1. **Add `.js` to the two extensionless source imports** so a `tsc`-style emit would be correct too (`src/index.js`, `src/axiom-http.js`).
2. **Stop `tsc` from emitting `.js`** — set `emitDeclarationOnly: true` in `tsconfig.json`. `tsc` now only produces the `.d.ts` declarations (`axiom-api.d.ts`, `axiom-http.d.ts`, `config.d.ts`, `index.d.ts`), which is what we actually need it for.
3. **Let `vite` own both `.js` outputs.** The existing `formats: ["es", "cjs"]` config already emitted ESM — the only reason it didn't reach users was that `tsc` was overwriting it with a broken multi-file build. Now `dist/es/index.js` is a single self-contained 6.6 kB bundle, mirroring the CJS strategy. No relative imports → no extension problem.

Verified by running the published reproducer (`npm install`, `import { AxiomApi } from '@axiom_ai/api'`) against the freshly built artifact — prints `function`, exits 0. All 26 existing tests still pass; the public API surface (`AxiomApi` class, all methods including `browserOpen`, `browserClose`, `goto`, `click`, `scrape`, `wait`, etc.) is unchanged.
