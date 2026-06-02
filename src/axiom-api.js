import { AxiomHttp, AxiomHttpError } from './axiom-http.js'

// Tuning for the transparent long-running-step polling fallback. The library POSTs
// /step with STEP_HTTP_TIMEOUT_MS as the abort deadline; if the POST times out, hits
// a gateway error, or the backend says a previous step is still in flight, the
// library polls /step/result with exponential backoff until the result lands or
// STEP_MAX_POLL_DURATION_MS elapses.
const STEP_HTTP_TIMEOUT_MS = 120_000
const STEP_MAX_POLL_DURATION_MS = 3_600_000
const STEP_POLL_INITIAL_INTERVAL_MS = 3_000
const STEP_POLL_MAX_INTERVAL_MS = 30_000
const STEP_POLL_BACKOFF_FACTOR = 1.5

// Mirrors the metadataOptions list in axiom_extension
// (src/axiombuilder/components/params/Metadata.vue). The cloud-side driver
// (axiom_lib AxiomApiDriver.scrapeMetadata) keys off `item.id` and `item.value`,
// so each entry must match the extension's shape exactly. Keep in sync when the
// extension's catalog changes.
const SCRAPE_METADATA_CATALOG = [
    { name: 'Title', value: 'title', description: '<title> tag', category: 'General Metadata', id: 'general_metadata_title' },
    { name: 'Description', value: "meta[name='description']", description: '<meta name="description" content="...">', category: 'General Metadata', id: 'general_metadata_description' },
    { name: 'Keywords', value: "meta[name='keywords']", description: '<meta name="keywords" content="...">', category: 'General Metadata', id: 'general_metadata_keywords' },
    { name: 'Viewport', value: "meta[name='viewport']", description: '<meta name="viewport" content="...">', category: 'General Metadata', id: 'general_metadata_viewport' },
    { name: 'Author', value: "meta[name='author']", description: '<meta name="author" content="...">', category: 'General Metadata', id: 'general_metadata_author' },
    { name: 'Generator', value: "meta[name='generator']", description: '<meta name="generator" content="...">', category: 'General Metadata', id: 'general_metadata_generator' },
    { name: 'Copyright', value: "meta[name='copyright']", description: '<meta name="copyright" content="...">', category: 'General Metadata', id: 'general_metadata_copyright' },
    { name: 'Title', value: "meta[property='og:title']", description: '<meta property="og:title" content="...">', category: 'Open Graph (OG) Metadata', id: 'open_graph_(og)_metadata_title' },
    { name: 'Description', value: "meta[property='og:description']", description: '<meta property="og:description" content="...">', category: 'Open Graph (OG) Metadata', id: 'open_graph_(og)_metadata_description' },
    { name: 'Image', value: "meta[property='og:image']", description: '<meta property="og:image" content="...">', category: 'Open Graph (OG) Metadata', id: 'open_graph_(og)_metadata_image' },
    { name: 'URL', value: "meta[property='og:url']", description: '<meta property="og:url" content="...">', category: 'Open Graph (OG) Metadata', id: 'open_graph_(og)_metadata_url' },
    { name: 'Type', value: "meta[property='og:type']", description: '<meta property="og:type" content="...">', category: 'Open Graph (OG) Metadata', id: 'open_graph_(og)_metadata_type' },
    { name: 'Site Name', value: "meta[property='og:site_name']", description: '<meta property="og:site_name" content="...">', category: 'Open Graph (OG) Metadata', id: 'open_graph_(og)_metadata_site_name' },
    { name: 'Card Type', value: "meta[name='twitter:card']", description: '<meta name="twitter:card" content="...">', category: 'Twitter Card Metadata', id: 'twitter_card_metadata_card_type' },
    { name: 'Title', value: "meta[name='twitter:title']", description: '<meta name="twitter:title" content="...">', category: 'Twitter Card Metadata', id: 'twitter_card_metadata_title' },
    { name: 'Description', value: "meta[name='twitter:description']", description: '<meta name="twitter:description" content="...">', category: 'Twitter Card Metadata', id: 'twitter_card_metadata_description' },
    { name: 'Image', value: "meta[name='twitter:image']", description: '<meta name="twitter:image" content="...">', category: 'Twitter Card Metadata', id: 'twitter_card_metadata_image' },
    { name: 'Site Handle', value: "meta[name='twitter:site']", description: '<meta name="twitter:site" content="...">', category: 'Twitter Card Metadata', id: 'twitter_card_metadata_site_handle' },
    { name: 'Canonical URL', value: "link[rel='canonical']", description: '<link rel="canonical" href="...">', category: 'SEO Metadata', id: 'seo_metadata_canonical_url' },
    { name: 'Robots Directive', value: "meta[name='robots']", description: '<meta name="robots" content="...">', category: 'SEO Metadata', id: 'seo_metadata_robots_directive' },
    { name: 'Hreflang Tags', value: "link[rel='alternate'][hreflang]", description: '<link rel="alternate" hreflang="en-us" href="...">', category: 'SEO Metadata', id: 'seo_metadata_hreflang_tags' },
    { name: 'Pagination (prev)', value: "link[rel='prev']", description: '<link rel="prev" href="...">', category: 'SEO Metadata', id: 'seo_metadata_pagination_(prev)' },
    { name: 'Pagination (next)', value: "link[rel='next']", description: '<link rel="next" href="...">', category: 'SEO Metadata', id: 'seo_metadata_pagination_(next)' },
    { name: 'Breadcrumbs', value: '@type=BreadcrumbList', description: '@type: BreadcrumbList', category: 'Schema.org Structured Data', id: 'schema.org_structured_data_breadcrumbs' },
    { name: 'Product Details', value: '@type=Product', description: '@type: Product', category: 'Schema.org Structured Data', id: 'schema.org_structured_data_product_details' },
    { name: 'Organization Info', value: '@type=Organization', description: '@type: Organization', category: 'Schema.org Structured Data', id: 'schema.org_structured_data_organization_info' },
    { name: 'Article/Blog Post Info', value: '@type=Article', description: '@type: Article', category: 'Schema.org Structured Data', id: 'schema.org_structured_data_article/blog_post_info' },
    { name: 'Event Details', value: '@type=Event', description: '@type: Event', category: 'Schema.org Structured Data', id: 'schema.org_structured_data_event_details' },
    { name: 'Favicon', value: "link[rel='icon']", description: '<link rel="icon" href="...">', category: 'Link Metadata', id: 'link_metadata_favicon' },
    { name: 'Stylesheets', value: "link[rel='stylesheet']", description: '<link rel="stylesheet" href="...">', category: 'Link Metadata', id: 'link_metadata_stylesheets' },
    { name: 'RSS Feeds', value: "link[rel='alternate'][type='application/rss+xml']", description: '<link rel="alternate" type="application/rss+xml" href="...">', category: 'Link Metadata', id: 'link_metadata_rss_feeds' },
    { name: 'Preload', value: "link[rel='preload']", description: '<link rel="preload" href="...">', category: 'Performance Metadata', id: 'performance_metadata_preload' },
    { name: 'Prefetch', value: "link[rel='prefetch']", description: '<link rel="prefetch" href="...">', category: 'Performance Metadata', id: 'performance_metadata_prefetch' },
    { name: 'Facebook App ID', value: "meta[property='fb:app_id']", description: '<meta property="fb:app_id" content="...">', category: 'Social Media and Sharing', id: 'social_media_and_sharing_facebook_app_id' },
    { name: 'Google Verification', value: "meta[name='google-site-verification']", description: '<meta name="google-site-verification" content="...">', category: 'Social Media and Sharing', id: 'social_media_and_sharing_google_verification' },
    { name: 'Bing Verification', value: "meta[name='msvalidate.01']", description: '<meta name="msvalidate.01" content="...">', category: 'Social Media and Sharing', id: 'social_media_and_sharing_bing_verification' },
    { name: 'Pinterest Verification', value: "meta[name='p:domain_verify']", description: '<meta name="p:domain_verify" content="...">', category: 'Social Media and Sharing', id: 'social_media_and_sharing_pinterest_verification' },
    { name: 'Google Analytics ID', value: 'script[src*="gtag.js"], script[src*="analytics.js"]', description: 'Found in <script> tags with gtag.js or analytics.js.', category: 'Analytics and Tracking', id: 'analytics_and_tracking_google_analytics_id' },
    { name: 'Facebook Pixel ID', value: 'script[src*="connect.facebook.net"]', description: 'Found in <script> tags.', category: 'Analytics and Tracking', id: 'analytics_and_tracking_facebook_pixel_id' },
]

const SCRAPE_METADATA_CATEGORY_PREFIXES = {
    general:   'General Metadata',
    og:        'Open Graph (OG) Metadata',
    twitter:   'Twitter Card Metadata',
    seo:       'SEO Metadata',
    schema:    'Schema.org Structured Data',
    link:      'Link Metadata',
    perf:      'Performance Metadata',
    social:    'Social Media and Sharing',
    analytics: 'Analytics and Tracking',
}

const SCRAPE_METADATA_BY_ALIAS = (() => {
    const map = new Map()
    for (const item of SCRAPE_METADATA_CATALOG) {
        map.set(item.id, item)
        const short = item.name.toLowerCase()
        if (!map.has(short)) map.set(short, item)
    }
    for (const [prefix, category] of Object.entries(SCRAPE_METADATA_CATEGORY_PREFIXES)) {
        for (const item of SCRAPE_METADATA_CATALOG) {
            if (item.category === category) {
                map.set(`${prefix}:${item.name.toLowerCase()}`, item)
            }
        }
    }
    // Schema.org entries also get an alias matching their @type name (e.g. `schema:Product`,
    // `schema:Article`) — that's what developers actually look up, vs the catalog's
    // human-friendly labels like `'Product Details'`.
    for (const item of SCRAPE_METADATA_CATALOG) {
        if (item.category === 'Schema.org Structured Data') {
            const m = item.value.match(/^@type=(\w+)$/)
            if (m) map.set(`schema:${m[1].toLowerCase()}`, item)
        }
    }
    return map
})()

function resolveScrapeMetadataItem(item) {
    if (item && typeof item === 'object' && typeof item.id === 'string') {
        return item
    }
    if (typeof item === 'string') {
        const resolved = SCRAPE_METADATA_BY_ALIAS.get(item.toLowerCase())
        if (!resolved) {
            throw new Error(
                `scrapeMetadata: unknown field "${item}". Pass a short name (e.g. "title"), ` +
                `a prefixed alias (e.g. "og:title", "twitter:image", "schema:Product"), a full id ` +
                `(e.g. "general_metadata_title"), or a complete descriptor object.`
            )
        }
        return resolved
    }
    throw new Error(
        `scrapeMetadata: each item must be a string alias or a descriptor object with an "id" property (got ${typeof item})`
    )
}

/**
 * @class
 * @public
 * A class for interacting with the Axiom API.
 */
export class AxiomApi {

    /**
     * @param {string} token API access token.
     */
    constructor(token) {
        this.cdpLink = '';
        this.token = token;
        this.http = new AxiomHttp();
    }

    async browserOpen() {
        const content = await this.http.post('/api/v5/browser/open', this.token)
        this.cdpLink = content.endpoint
        return content.endpoint
    }

    async browserClose(cdpLink = '') {
        if (!cdpLink) {
            cdpLink = this.cdpLink
        }
        const content = await this.http.post('/api/v5/browser/close', this.token, {cdpLink})
        // Reset CDPLink to avoid staleness
        this.cdpLink = ''
        return content.message
    }

    // TODO: Probably should be mvoed to a non-user facing component
    async step(mode, method, params, cdpLink = '') {
        try {
            const content = await this.http.post('/api/v5/step', this.token, {
                mode, method, params, cdpLink
            }, { timeoutMs: STEP_HTTP_TIMEOUT_MS })
            if (content && content.message !== undefined) {
                return content.message
            }
            return content
        } catch (e) {
            // Can only fall back to polling when there is a session to address.
            // One-shot /step calls have no cdpLink and surface the original error.
            if (!cdpLink || !this._shouldFallBackToPolling(e)) throw e
            return this._pollStepResult(cdpLink, e)
        }
    }

    _shouldFallBackToPolling(error) {
        // Direct POST never reached or never returned — step may still be running on the pod.
        if (error && error.name === 'AbortError') return true
        // Native fetch network failure (DNS, connection reset, etc.) surfaces as TypeError.
        if (error && error.name === 'TypeError') return true
        if (error instanceof AxiomHttpError) {
            if (error.status === 502 || error.status === 503 || error.status === 504) return true
            if (error.status === 409 && typeof error.message === 'string'
                && error.message.indexOf('Step already in progress') !== -1) return true
        }
        return false
    }

    async _pollStepResult(cdpLink, originalError) {
        const deadline = Date.now() + STEP_MAX_POLL_DURATION_MS
        let intervalMs = STEP_POLL_INITIAL_INTERVAL_MS
        while (Date.now() < deadline) {
            await this._sleep(intervalMs)
            try {
                const content = await this.http.post('/api/v5/step/result', this.token, { cdpLink })
                if (content && content.status === 'complete') return content.result
                if (content && content.status === 'running') {
                    intervalMs = Math.min(intervalMs * STEP_POLL_BACKOFF_FACTOR, STEP_POLL_MAX_INTERVAL_MS)
                    continue
                }
                if (content && content.status === 'none') {
                    throw new Error('Step did not start on the pod. Original error: '
                        + (originalError && originalError.message ? originalError.message : 'unknown'))
                }
                throw new Error('Unexpected /step/result response: ' + JSON.stringify(content))
            } catch (e) {
                // Executor is gone (step error → finish('Failure') removed it).
                // Surface as a hard failure — the task report has the detail.
                if (e instanceof AxiomHttpError && e.status === 409) {
                    throw new Error('Step failed on the pod — check the task report. ' + (e.message || ''))
                }
                // Auth or other definite 4xx — don't keep polling.
                if (e instanceof AxiomHttpError && e.status >= 400 && e.status < 500
                    && e.status !== 502 && e.status !== 503 && e.status !== 504) {
                    throw e
                }
                // Transient network issue mid-poll — back off and retry.
                intervalMs = Math.min(intervalMs * STEP_POLL_BACKOFF_FACTOR, STEP_POLL_MAX_INTERVAL_MS)
            }
        }
        throw new Error('Step polling exceeded ' + (STEP_MAX_POLL_DURATION_MS / 1000)
            + 's. Original error: '
            + (originalError && originalError.message ? originalError.message : 'unknown'))
    }

    async scrape(url, selector, pager, max_results, settings) {
        return this.step(
            'browser',
            'AxiomApiSmartScrapeV4400',
            [url, selector, pager, max_results, settings],
            this.cdpLink
        )
    }

    async integrateAI(aiOptions) {
        return this.step(
            'browser',
            'AxiomApiAiGeneric',
            [aiOptions],
            this.cdpLink
        )
    }

    async datePicker(selectMonth, selectMonthChangeButton, changeMonthTo, changeDayOfMonthTo) {
        return this.step(
            'driver',
            'datePicker',
            [selectMonth, selectMonthChangeButton, changeMonthTo, changeDayOfMonthTo],
            this.cdpLink
        )
    }

    async click(select, leftClickRightClick, optionalClick) {
        return this.step(
            'driver',
            'clickV3130',
            [select, leftClickRightClick, optionalClick],
            this.cdpLink
        )
    }

    async clickEngagementButton(select, setValueToCheck) {
        return this.step(
            'driver',
            'clickEngagementButton',
            [select, setValueToCheck],
            this.cdpLink
        )
    }

    async clickMultiple(select, leftClickRightClick, maxClicks) {
        return this.step(
            'driver',
            'multiClickV3170',
            [select, leftClickRightClick, maxClicks],
            this.cdpLink
        )
    }

    async getClipboardContents() {
        return this.step(
            'driver',
            'readClipboardContents',
            [],
            this.cdpLink
        )
    }

    async enterText(selectTextField, text, delay = 0, appendExisting = false, customLineBreak = null, optionalText = false) {
        return this.step(
            'driver',
            'enterTextV4500',
            [selectTextField, text, delay, appendExisting, customLineBreak, optionalText],
            this.cdpLink
        )
    }

    async goto(url, doNotShareLocalstorage = false, openInNewTab = false) {
        return this.step(
            'driver',
            'gotoV4070',
            [url, null, doNotShareLocalstorage, openInNewTab],
            this.cdpLink
        )
    }

    async pressKeys(key, delimiter, delay) {
        return this.step(
            'driver',
            'keydownV3120',
            [key, null, delimiter, delay],
            this.cdpLink
        )
    }

    async clickAndDrag(startCoordinates, endCoordinates) {
        return this.step(
            'driver',
            'mouseClickDragV0300',
            [startCoordinates, endCoordinates],
            this.cdpLink
        )
    }

    async scrapeMetadata(fields) {
        const items = Array.isArray(fields) ? fields : [fields]
        const resolved = items.map(resolveScrapeMetadataItem)
        return this.step(
            'driver',
            'scrapeMetadata',
            [resolved],
            this.cdpLink
        )
    }

    async selectList(select, text) {
        return this.step(
            'driver',
            'selectList',
            [select, text],
            this.cdpLink
        )
    }

    async solveCaptcha(apiKey) {
        return this.step(
            'driver',
            'solveCaptchaV450',
            [null, null, apiKey],
            this.cdpLink
        )
    }

    async switchBrowserTab(selectTab) {
        return this.step(
            'driver',
            'switchBrowserTab',
            [selectTab],
            this.cdpLink
        )
    }

    // Pause on the pod, not in the client process, so the pod's session inactivity
    // timer is reset by the step. A purely local sleep would let the session idle
    // out and auto-close while the client was still happily waiting. Falls back to
    // a local sleep when there is no session — nothing to keep alive.
    async wait(time) {
        if (this.cdpLink) {
            return this.step('driver', 'wait', [time], this.cdpLink)
        }
        return this._sleep(time)
    }

    // Local-only sleep, used by the polling loop's backoff. Never routes to the
    // pod — that would be circular (the polling loop's whole purpose is to wait
    // out a pod-side step that has lost its HTTP connection).
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async hover(select) {
        return this.step(
            'driver',
            'hover',
            [select],
            this.cdpLink
        )
    }

    async restartBrowser() {
        return this.step(
            'browser',
            'AxiomApiRestartBrowser',
            [],
            this.cdpLink
        )
    }

}