# 🤖 Axiom AI API Library

---

This repository contains the **Axiom AI API library**.

## Usage

To use the library, you'll first need to import the `AxiomApi` class and then wrap your automation steps within `browserOpen()` and `browserClose()`.

### Example

Here is a basic example of how to structure your code:

```javascript
import { AxiomApi } from '@axiom_ai/api';

async function run() {
    // 1. Initialize the AxiomApi class
    const axiom = new AxiomApi('[API_KEY]');

    // 2. Open the browser connection
    await axiom.browserOpen();

    // 3. Add your automation steps here (e.g., axiom.goto(), axiom.click(), axiom.enterText(), axiom.scrape(), etc.)
    // ... add steps ...

    // 4. Close the browser connection when done
    await axiom.browserClose();
}

run();
```

## Working with Claude Code (or other agents)

This package bundles agent-targeted documentation alongside the runtime:

- [`CLAUDE.md`](./CLAUDE.md) — full method surface, error semantics, common patterns, auth + signup, and the methods *not* to call. Read by Claude automatically when this package is installed in a project.
- [`AGENTS.md`](./AGENTS.md) — same content, surfaced for non-Claude agents that follow the `AGENTS.md` convention.
- [`examples/`](./examples/) — three runnable scripts (`simple-scrape.js`, `login-then-extract.js`, `parallel-sessions.js`).

If you want Claude to *invent* an axiom from a prompt rather than help you write API calls yourself, also see [`@axiom_ai/claude-skill`](https://github.com/axiom-browser-automation/claude-skill) — the marketplace plugin covers both this library and the no-code dashboard path.