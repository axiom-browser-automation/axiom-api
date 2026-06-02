// Smallest valid axiom: open browser, navigate, scrape, close.
// Validator checks: methods on allowlist, try/finally lifecycle, no hardcoded token.

import { AxiomApi } from '@axiom_ai/api'

async function main() {
  const axiom = new AxiomApi(process.env.AXIOM_API_KEY)

  await axiom.browserOpen()
  try {
    await axiom.goto('https://example.com/products')
    const rows = await axiom.scrape(null, '.product-card', null, 50, {})
    console.log(`Found ${rows.length} products`)
    return rows
  } finally {
    await axiom.browserClose()
  }
}

await main()
