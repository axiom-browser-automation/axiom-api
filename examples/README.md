# Examples

Runnable Node scripts demonstrating common `@axiom_ai/api` patterns. Each is small (20-30 lines), ES-module syntax, and reads its API key from `AXIOM_API_KEY` in the environment.

| File | Demonstrates |
|---|---|
| [`simple-scrape.js`](./simple-scrape.js) | Smallest valid axiom — `browserOpen → goto → scrape → browserClose` with `try/finally`. |
| [`login-then-extract.js`](./login-then-extract.js) | `enterText` + `click` + `wait` for an auth flow, then scrape behind the login. |
| [`parallel-sessions.js`](./parallel-sessions.js) | Two `AxiomApi` instances side by side — each has its own lifecycle. |

Run any of them with:

```bash
AXIOM_API_KEY=your-key node simple-scrape.js
```

The full method surface, error semantics, and patterns reference is in [`../CLAUDE.md`](../CLAUDE.md).
