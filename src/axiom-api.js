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

    async scrapeMetadata(metadata) {
        return this.step(
            'driver',
            'scrapeMetadata',
            [metadata],
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