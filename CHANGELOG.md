# Changelog

## 1.0.4 — docs: `examples/` and `CLAUDE.md` now pass the URL to `scrape()` instead of the unsupported `scrape(null)` pattern

The agent-targeted docs bundled in v1.0.2/v1.0.3 taught a broken pattern: `await axiom.goto(url)` then `await axiom.scrape(null, selector, …)` to "scrape the current page." The API doesn't support that — `scrape()` is designed to navigate itself (it calls `this.driver.goto(url)` internally and extracts in the same call). Passing `null` for the URL crashes the cloud driver with a 500 (`Cannot read properties of null (reading 'length')`). There is no supported "scrape the page I'm already on" mode.

The authoritative top-level `README.md` was already correct; only the bundled `CLAUDE.md` and `examples/*.js` shipped the wrong pattern. Since those files ride in the npm tarball at `node_modules/@axiom_ai/api/`, every consumer asking Claude for help has been getting an incorrect prescription.

Fix (docs-only, no `src/` changes):

- `CLAUDE.md` — `scrape()` row in the method table now states `url` is required and notes that cookies persist across the internal navigation (so it works after a login flow too). All three example blocks in the "Common patterns" section drop the separate `goto()` and pass the URL directly to `scrape(url, selector, …)`.
- `examples/simple-scrape.js`, `examples/login-then-extract.js`, `examples/parallel-sessions.js` — same correction. `login-then-extract.js` keeps the login `goto`/`enterText`/`click`/`wait` sequence; only the post-authentication `goto + scrape(null)` pair collapses into a single `scrape(url)`.

Tests still 29/29 (no `src/` changes). The validator-enforced `browserOpen() / try / finally / browserClose()` lifecycle and the no-hardcoded-token invariant remain intact in every example.

## 1.0.2 — fix: `scrape()` was calling a misspelt backend method; bundled agent docs

Two changes shipped together:

**Bug fix — `scrape()` was calling `AxiomApiSmartScrapeV440` instead of `AxiomApiSmartScrapeV4400`.** A trailing-`0` typo in the backend method name meant every call to `axiom.scrape(url, selector, ...)` against `/api/v5/step` hit a method the Laravel router doesn't recognise and failed before any scraping happened. CJS and ESM were both affected — this is independent of the 1.0.1 ESM fix. Fix: corrected the literal in `src/axiom-api.js:117` and the matching test assertions in `test/base.test.js:51` and `:323`. Unit tests still 26/26 green.

**Bundled agent documentation.** Anyone running `npm install @axiom_ai/api` and asking Claude (or another agent) for help previously got no agent-targeted material — Claude either guessed the API surface or scraped the website, which is how phantom methods (`navigate`, `type`, `getText`) keep appearing in generated code. To close that gap without requiring a separate `/plugin install`:

- `CLAUDE.md` at the package root: public method surface table by category (lifecycle, navigation, interaction, data, AI/utility), methods *not* to call, common patterns, error semantics (401/403/409/5xx), auth flow, and a maintainer build/test section.
- `AGENTS.md`: one-line redirect to `CLAUDE.md` for agents following the AGENTS.md convention (Cursor and others).
- `examples/`: three runnable scripts — `simple-scrape.js`, `login-then-extract.js`, `parallel-sessions.js` — plus an index README.
- `package.json` `files` allowlist updated to `["dist", "CLAUDE.md", "AGENTS.md", "examples"]` so all of the above ship in the published tarball, and `keywords` gains `claude`, `claude-code`, `agents-md`, `llm-friendly` for npm-search discovery.

Strictly additive on the runtime side — no API surface change beyond the scrape fix. Existing 1.0.1 consumers upgrading just get a working `scrape()` plus richer `node_modules/@axiom_ai/api/` content for their agents to read.

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
