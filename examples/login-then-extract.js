// Log into a site, then scrape behind auth. Demonstrates: enterText, click, wait.

import { AxiomApi } from '@axiom_ai/api'

async function main() {
  const axiom = new AxiomApi(process.env.AXIOM_API_KEY)

  await axiom.browserOpen()
  try {
    await axiom.goto('https://example.com/login')
    await axiom.enterText('#email', process.env.SITE_EMAIL)
    await axiom.enterText('#password', process.env.SITE_PASSWORD)
    await axiom.click('button[type=submit]')
    // Wait on the pod (keeps the session alive) rather than a local setTimeout.
    await axiom.wait(2000)

    // Session/cookies persist, so scrape navigates to the authenticated page directly.
    const rows = await axiom.scrape('https://example.com/dashboard', '.report-row', null, 100, {})
    return rows
  } finally {
    await axiom.browserClose()
  }
}

await main()
