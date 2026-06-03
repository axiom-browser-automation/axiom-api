# CLAUDE.md — `@axiom_ai/api` agent instructions

Reference doc Claude (and other agents following the AGENTS.md convention) read when working with this package — both inside this repo and after `npm install @axiom_ai/api` puts a copy at `node_modules/@axiom_ai/api/CLAUDE.md` in a consumer project. Keep this terse and code-truth-aligned; the actual source-of-truth is [`src/axiom-api.js`](./src/axiom-api.js).

## What this package is

A small Node library that drives Axiom.ai's cloud browser pool over a REST API (`/api/v5/*`). It is **not** a Puppeteer/Playwright wrapper and **does not** speak CDP — it calls named step functions on a Laravel backend (`https://lar.axiom.ai`) that run inside the cloud browser. If you want raw CDP, that's the separate Chrome API surface — see [the website's API overview](https://axiom.ai/docs/developer-hub/api).

Bundled in the npm tarball alongside source-built `dist/`:
- This file (`CLAUDE.md`) — surface + patterns.
- `AGENTS.md` — redirect to here for non-Claude agents.
- `examples/` — three runnable Node scripts: `simple-scrape.js`, `login-then-extract.js`, `parallel-sessions.js`.

## Public method surface

Every method below is on the `AxiomApi` class. Construct with `new AxiomApi(apiKey)`; the key comes from the user's account (see "Auth + signup" below).

### Lifecycle (always pair these)

| Method | Notes |
|---|---|
| `browserOpen()` | Opens a cloud browser session. Returns the CDP endpoint and caches it on the instance as `axiom.cdpLink`. |
| `browserClose(cdpLink?)` | Closes the session. Pass `cdpLink` only if closing a session from a different instance (rare). |

**Wrap every script in `try { … } finally { await axiom.browserClose() }`** so a thrown step doesn't leak a cloud session.

### Navigation

| Method | Notes |
|---|---|
| `goto(url, doNotShareLocalstorage?, openInNewTab?)` | Navigate the current tab (or a new one if third arg is `true`). |
| `switchBrowserTab(selectTab)` | Switch focus to a tab by name/URL substring. |

### Interaction

| Method | Notes |
|---|---|
| `click(select, leftClickRightClick?, optionalClick?)` | Single click. `optionalClick: true` no-ops when the selector doesn't match. |
| `clickMultiple(select, leftClickRightClick?, maxClicks?)` | Click every match up to `maxClicks`. |
| `clickEngagementButton(select, setValueToCheck)` | Idempotent like/follow/subscribe toggle. |
| `hover(select)` | Mouse-over an element. |
| `clickAndDrag(startCoordinates, endCoordinates)` | Mouse-down at one point, release at another. Coordinates are `{scrollX, scrollY, clientX, clientY}` objects. |
| `enterText(selectTextField, text, delay?, appendExisting?, customLineBreak?, optionalText?)` | Type into an input field. |
| `pressKeys(key, delimiter?, delay?)` | Fire keyboard events (Enter, Tab, arrow keys, modifier combos). |
| `selectList(select, text)` | Pick an option from a `<select>` by visible text. |
| `datePicker(selectMonth, selectMonthChangeButton, changeMonthTo, changeDayOfMonthTo)` | Step through a calendar widget. |

### Data

| Method | Notes |
|---|---|
| `scrape(url, selector, pager, max_results, settings)` | Smart-scrape rows. `scrape` navigates to `url` (or to each URL in turn if given an array) and extracts matching rows in the same call — `url` is required, do not pass `null`. Browser session/cookies persist across the internal navigation, so this works after a login flow too: just pass the post-login page's URL. Returns an array of objects. |
| `scrapeMetadata(fields)` | Extract structured page-level fields. `fields` is an array — items may be short aliases (`'title'`, `'description'`, `'keywords'`), category-prefixed aliases (`'og:title'`, `'twitter:image'`, `'schema:Product'`, `'seo:canonical url'`), full ids (`'general_metadata_title'`), or complete descriptor objects (passed through). Unknown aliases throw. |
| `getClipboardContents()` | Read the cloud browser's clipboard (after a copy step). |

### AI and utility

| Method | Notes |
|---|---|
| `integrateAI(aiOptions)` | Inline LLM call (extract or generate). `aiOptions: {aiFunction, key?, model?, prompt?, extractData?, promptExtract?}`. |
| `solveCaptcha(apiKey?)` | Hand the current page's captcha to a third-party solver. Omit `apiKey` to use the one stored on the account. |
| `wait(time)` | Pause **on the cloud pod** (keeps the session alive) for `time` ms. Use this rather than client-side `setTimeout`. |
| `restartBrowser()` | Restart Chrome within the same session — useful between unrelated flows. |

## Methods NOT to call

These exist on the class but are not part of the public surface — don't emit them in generated code:

- `step(mode, method, params, cdpLink)` — the internal dispatcher every public method routes through. If you ever feel like calling `step()` directly, that means a named wrapper is missing; file an issue, don't paper over it.
- `_sleep(ms)` — client-side sleep helper. Internal; use `wait(time)` (cloud-side) for browser pacing.
- `_pollStepResult(...)` / `_shouldFallBackToPolling(...)` — error-recovery internals.

## Common patterns

### Simplest scrape — open, scrape (navigates internally), close

```javascript
import { AxiomApi } from '@axiom_ai/api'

const axiom = new AxiomApi(process.env.AXIOM_API_KEY)
await axiom.browserOpen()
try {
    // scrape() navigates to the URL and extracts in one call.
    const rows = await axiom.scrape('https://example.com/products', '.product-card', null, 50, {})
    console.log(`Found ${rows.length} products`)
} finally {
    await axiom.browserClose()
}
```

### Login then extract

```javascript
await axiom.goto('https://example.com/login')
await axiom.enterText('input[name=email]', process.env.LOGIN_EMAIL)
await axiom.enterText('input[name=password]', process.env.LOGIN_PASSWORD)
await axiom.click('button[type=submit]')
await axiom.wait(2000)                              // settle on the dashboard
// Session/cookies persist, so scrape can navigate to the authenticated page directly.
const rows = await axiom.scrape('https://example.com/dashboard', '.row', null, 100, {})
```

### Parallel sessions

Create independent `AxiomApi` instances — each calls `browserOpen()` and `browserClose()` independently. Don't share `cdpLink` between them.

```javascript
const a = new AxiomApi(KEY); const b = new AxiomApi(KEY)
await Promise.all([a.browserOpen(), b.browserOpen()])
try {
    const [rowsA, rowsB] = await Promise.all([
        a.scrape('https://a.test', '.row', null, 50, {}),
        b.scrape('https://b.test', '.row', null, 50, {}),
    ])
} finally {
    await Promise.all([a.browserClose(), b.browserClose()])
}
```

See [`examples/`](./examples/) for runnable versions of these.

## Error semantics

The library throws `AxiomHttpError` on non-2xx responses. Common shapes:

| Status | Meaning | What to do |
|---|---|---|
| 401 | API key invalid / expired | Re-mint the key — don't retry. |
| 403 | Account-level block (quota, abuse, plan) | Don't retry; surface to the user. |
| 409 | A step is already in flight on this `cdpLink` | Library auto-polls `/api/v5/step/result` and returns the result transparently. You shouldn't normally see 409 propagate. |
| 502 / 503 / 504 | Pod transient | Library auto-falls-back to polling. If still failing after polling, retry the whole `browserOpen → … → browserClose` flow. |
| Other 4xx | Bad params (wrong selector type, missing required arg) | Inspect the error body and fix the call. |

## Auth + signup

The `AXIOM_API_KEY` env var holds the long-lived key. Two ways to get one:

1. **Interactive** — sign up at [axiom.ai](https://axiom.ai), open the dashboard, copy the key.
2. **Programmatic** — three-call flow documented at [`/docs/developer-hub/api/programmatic-signup`](https://axiom.ai/docs/developer-hub/api/programmatic-signup): `POST /api/user/create` → `POST /api/user/login` → `GET /api/user/key/create`. Suitable for headless onboarding.

## Relationship to `@axiom_ai/claude-skill`

If the user is asking Claude to **build an axiom from a prompt** (e.g. "scrape this site daily and email me", "build me a bot that…"), the explicit marketplace plugin [`@axiom_ai/claude-skill`](https://github.com/axiom-browser-automation/claude-skill) gives Claude a richer guided experience — it covers both the *coded* path (this package) and the *no-code* path (saving to the user's dashboard). Use it when the user wants Claude to *invent* an axiom; this CLAUDE.md is enough when the user is *writing their own code* and asking Claude for help with the API surface.

## Build + test (for maintainers working in this repo)

```bash
npm ci          # install deps
npm test        # jest, 26 tests, runs against nock mocks (no live calls)
npm run build   # vite produces dist/{es,cjs}/index.js; tsc emits .d.ts only
```

**Watch-out from v1.0.1**: `tsconfig.json` is set to `emitDeclarationOnly: true`. If you change that, `tsc` will start emitting multi-file `.js` into `dist/es/` and clobber vite's single-bundle build — the result imports fine under CJS but fails under modern Node ESM with `ERR_MODULE_NOT_FOUND` on extensionless internal imports. Leave the flag alone unless you also wire up vite/tsc differently.

Publishing is via the Jenkins job `Publishing/axiom-api-publish` on the team's Jenkins; manual trigger only.
