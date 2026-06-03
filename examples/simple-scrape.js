// Smallest valid axiom: open browser, scrape (navigates internally), close.
// Validator checks: methods on allowlist, try/finally lifecycle, no hardcoded token.

import { AxiomApi } from '@axiom_ai/api'

async function main() {
  const axiom = new AxiomApi(process.env.AXIOM_API_KEY)

  await axiom.browserOpen()
  try {
    // scrape() navigates to the URL and extracts in one call.
    const rows = await axiom.scrape('https://example.com/products', '.product-card', null, 50, {})
    console.log(`Found ${rows.length} products`)
    return rows
  } finally {
    await axiom.browserClose()
  }
}

await main()
