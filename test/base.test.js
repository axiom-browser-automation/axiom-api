import { AxiomApi } from '../src/axiom-api.js';
import nock from 'nock';

nock('https://lar-simon.axiom.ai')
    .post('/api/v5/browser/open')
    .reply(200, {
        endpoint: 'ws://test-cdp-link'
    })
    .post('/api/v5/browser/close')
    .reply(200, {
        message: 'Browser session closed successfully.'
    })

const axiomApi = new AxiomApi('test-token')

describe('Basic library tests', () => {

    beforeEach(() => {

    })

    // Basic boostrap test
    test('should bootstrap AxiomApi class', () => {
        expect(axiomApi.token).toBe("test-token");
    });

    test('should open and close a browser', async () => {
        const cdpLink = await axiomApi.browserOpen();
        expect(cdpLink).toBe('ws://test-cdp-link')
        const message = await axiomApi.browserClose(cdpLink)
        expect(message).toBe('Browser session closed successfully.')
    })

    test('should trigger a step', async () => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step')
            .reply(200, {
                message: 'Step command executed successfully.'
            })
        const axiomApi = new AxiomApi('test-token')
        const message = await axiomApi.step('mode', 'method', [])
        expect(message).toBe('Step command executed successfully.')
    })

    test('should scrape data', async () => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'browser',
                method: 'AxiomApiSmartScrapeV440',
                params: ['https://test', 'test', 'test', 20, {}],
                cdpLink: ''
            })
            .reply(200, [
                ['A', 'B', 'C']
            ])
        const results = await axiomApi.scrape('https://test', 'test', 'test', 20, {})
        expect(results).toStrictEqual([['A', 'B', 'C']])
    })

    test('should retrieve response from llm', async() => {
        const results = await axiomApi.integrateAI({})
        expect(true).toBe(false)
    })

    test('should interact with a date picker', async() => {
        const results = await axiomApi.datePicker('October', '.button', 'November', '13')
        expect(true).toBe(false)
    })

    test('should click', async() => {
        const results = await axiomApi.click('.button', false, false)
        expect(true).toBe(false)
    })

    test('should click engagement button', async() => {
        const results = await axiomApi.clickEngagementButton('.button', 'Liked')
        expect(true).toBe(false)
    })

    test('should click multiple', async() => {
        const results = await axiomApi.clickMultiple('.button', false, 0)
        expect(true).toBe(false)
    })

    test('should get clipboard contents', async() => {
        const results = await axiomApi.getClipboardContents()
        expect(true).toBe(false)
    })

    test('should enter text', async() => {
        const results = await axiomApi.enterText('.input', 'The Text', 0, false, null, false)
        expect(true).toBe(false)
    })

    test('should go to a new page', async() => {
        const results = await axiomApi.goto('https://wwww.axiom.ai', true, false)
        expect(true).toBe(false)
    })

    test('should press keys', async() => {
        const results = await axiomApi.pressKeys('Space', '|', 0)
        expect(true).toBe(false)
    })

    test('should click and drag', async() => {
        const results = await axiomApi.clickAndDrag({x: 0, y: 0}, {x: 100, y: 100})
        expect(true).toBe(false)
    })

    test('should scrape metadata', async() => {
        const results = await axiomApi.scrapeMetadata({})
        expect(true).toBe(false)
    })

    test('should interact with select list', async() => {
        const results = await axiomApi.selectList('.select', 'The Text')
        expect(true).toBe(false)
    })

    test('should solve captcha', async() => {
        const results = await axiomApi.solveCaptcha('apiKey')
        expect(true).toBe(false)
    })

    test('should switch browser tab', async() => {
        const results = await axiomApi.switchBrowserTab(1)
        expect(true).toBe(false)
    })

    test('should wait', async() => {
        const results = await axiomApi.wait({})
        expect(true).toBe(false)
    })

    test('should hover', async() => {
        const results = await axiomApi.hover('.button')
        expect(true).toBe(false)
    })

    test('should restart browser', async() => {
        const results = await axiomApi.restartBrowser()
        expect(true).toBe(false)
    })

});