const ENDPOINT = 'https://lar-simon.axiom.ai'

export class AxiomApi {

    constructor(token) {
        this.cdpLink = ''
        this.token = token
    }

    async browserOpen() {
        const rawResponse = await fetch(ENDPOINT + '/api/v5/browser/open', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([])
        });
        const content = await rawResponse.json();
        this.cdpLink = content.endpoint
        return content.endpoint
    }

    async browserClose(cdpLink = '') {
        if (cdpLink) {
            cdpLink = this.cdpLink
        }
        const rawResponse = await fetch(ENDPOINT + '/api/v5/browser/close', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({cdpLink})
        });
        const content = await rawResponse.json();        
        return content.message
    }

    // TODO: Probably should be mvoed to a non-user facing component
    async step(mode, method, params, cdpLink = '') {
        const rawResponse = await fetch(ENDPOINT + '/api/v5/step', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({mode, method, params, cdpLink})
        });
        const content = await rawResponse.json();
        if (content.message) {
            return content.message
        } else {
            return content
        }
    }

    async scrape(url, selector, pager, max_results, settings) {
        return this.step(
            'browser',
            'AxiomApiSmartScrapeV440',
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
            'driver.datePicker',
            [selectMonth, selectMonthChangeButton, changeMonthTo, changeDayOfMonthTo],
            this.cdpLink
        )
    }

    async click(select, leftClickRightClick, optionalClick) {
        return this.step(
            'driver',
            'driver.clickV3130',
            [select, leftClickRightClick, optionalClick],
            this.cdpLink
        )
    }

    async clickEngagementButton(select, setValueToCheck) {
        return this.step(
            'driver',
            'driver.clickEngagementButton',
            [select, setValueToCheck],
            this.cdpLink
        )
    }

    async clickMultiple(select, leftClickRightClick, maxClicks) {
        return this.step(
            'driver',
            'driver.multiClickV3170',
            [select, leftClickRightClick, maxClicks],
            this.cdpLink
        )
    }

    async getClipboardContents() {
        return this.step(
            'driver',
            'driver.readClipboardContents',
            [],
            this.cdpLink
        )
    }

    async enterText(selectTextField, text, delay, appendExisting, customLineBreak, optionalText) {
        return this.step(
            'driver',
            'driver.enterTextV4500',
            [selectTextField, text, delay, appendExisting, customLineBreak, optionalText],
            this.cdpLink
        )
    }

    async goto(url, doNotShareLocalstorage, openInNewTab) {
        return this.step(
            'driver',
            {driver: "driver.gotoV4070"},
            [url, null, doNotShareLocalstorage, openInNewTab]
        )
    }

    async pressKeys(key, delimiter, delay) {
        return this.step(
            'driver',
            'driver.keydownV3120',
            [key, null, delimiter, delay],
            "interact"
        )
    }

    async clickAndDrag(startCoordinates, endCoordinates) {
        return this.step(
            'driver',
            'driver.mouseClickDragV0300',
            [startCoordinates, endCoordinates],
            this.cdpLink
        )
    }

    async scrapeMetadata(metadata) {
        return this.step(
            'driver',
            { driver: "driver.scrapeMetadata" },
            [metadata],
            this.cdpLink
        )
    }

    async selectList(select, text) {
        return this.step(
            'driver',
            {driver: "driver.selectList"},
            [select, text],
            this.cdpLink
        )
    }

    async solveCaptcha(apiKey) {
        return this.step(
            'driver',
            'driver.solveCaptchaV450',
            [null, null, apiKey],
            this.cdpLink
        )
    }

    async switchBrowserTab(selectTab) {
        return this.step(
            'driver',
            'driver.switchBrowserTab',
            [selectTab],
            this.cdpLink
        )
    }

    async wait(timeOptions) {
        return this.step(
            'driver',
            'driver.waitV4000',
            [timeOptions],
            this.cdpLink
        )
    }

    async hover(select) {
        return this.step(
            'driver',
            'driver.hover',
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