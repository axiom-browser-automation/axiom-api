// Drive two sessions in parallel. Each gets its own AxiomApi instance + lifecycle.
// Demonstrates that browserClose() is per-instance, not global.

import { AxiomApi } from '@axiom_ai/api'

async function scrapeOne(url) {
  const axiom = new AxiomApi(process.env.AXIOM_API_KEY)
  await axiom.browserOpen()
  try {
    await axiom.goto(url)
    return await axiom.scrape(null, '.item', null, 20, {})
  } finally {
    await axiom.browserClose()
  }
}

async function main() {
  const urls = [
    'https://example.com/category/a',
    'https://example.com/category/b'
  ]
  const results = await Promise.all(urls.map(scrapeOne))
  console.log('Total rows:', results.flat().length)
}

await main()
