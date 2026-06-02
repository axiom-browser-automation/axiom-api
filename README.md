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