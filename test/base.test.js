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
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'browser',
                method: 'AxiomApiAiGeneric',
                params: [{}],
                cdpLink: ''
            })
            .reply(200, [
                ['AI response']
            ])
        const results = await axiomApi.integrateAI({})
        expect(results).toStrictEqual([['AI response']])
    })

    test('should interact with a date picker', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'datePicker',
                params: ['.datepicker', '.button', 'November', 13],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.datePicker('.datepicker', '.button', 'November', 13)
        expect(results).toBe('Step command executed successfully.')
    })

    test('should click', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'clickV3130',
                params: ['.button', false, false],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.click('.button', false, false)
        expect(results).toBe('Step command executed successfully.')
    })

    test('should click engagement button', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'clickEngagementButton',
                params: ['.button','Liked'],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.clickEngagementButton('.button', 'Liked')
        expect(results).toBe('Step command executed successfully.')
    })

    test('should click multiple', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'multiClickV3170',
                params: ['.button', false, 0],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.clickMultiple('.button', false, 0)
        expect(results).toBe('Step command executed successfully.')
    })

    test('should get clipboard contents', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'readClipboardContents',
                params: [],
                cdpLink: ''
            })
            .reply(200, 
                [['Clipboard contents']]
            )
        const results = await axiomApi.getClipboardContents()
        expect(results).toStrictEqual([['Clipboard contents']])
    })

    test('should enter text', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'enterTextV4500',
                params: ['.input', 'The Text', 0, false, null, false],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.enterText('.input', 'The Text', 0, false, null, false)
        expect(results).toBe('Step command executed successfully.')
    })

    test('should go to a new page', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'gotoV4070',
                params: ['https://wwww.axiom.ai', null, true, false],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.goto('https://wwww.axiom.ai', true, false)
        expect(results).toBe('Step command executed successfully.')
    })

    test('should press keys', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'keydownV3120',
                params: ['Space', null, '|', 0],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.pressKeys('Space', '|', 0)
        expect(results).toBe('Step command executed successfully.')
    })

    test('should click and drag', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'mouseClickDragV0300',
                params: [{x: 0, y: 0}, {x: 100, y: 100}],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.clickAndDrag({x: 0, y: 0}, {x: 100, y: 100})
        expect(results).toBe('Step command executed successfully.')
    })

    test('should scrape metadata', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'scrapeMetadata',
                params: [{}],
                cdpLink: ''
            })
            .reply(200, 
                [['Page metadata']]
            )
        const results = await axiomApi.scrapeMetadata({})
        expect(results).toStrictEqual([['Page metadata']])
    })

    test('should interact with select list', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'selectList',
                params: ['.select', 'The Text'],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.selectList('.select', 'The Text')
        expect(results).toBe('Step command executed successfully.')
    })

    test('should solve captcha', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'solveCaptchaV450',
                params: [null, null, 'apiKey'],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.solveCaptcha('apiKey')
        expect(results).toBe('Step command executed successfully.')
    })

    test('should switch browser tab', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'switchBrowserTab',
                params: [1],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.switchBrowserTab(1)
        expect(results).toBe('Step command executed successfully.')
    })

    test('should hover', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'driver',
                method: 'hover',
                params: ['.button'],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.hover('.button')
        expect(results).toBe('Step command executed successfully.')
    })

    test('should restart browser', async() => {
        nock('https://lar-simon.axiom.ai')
            .post('/api/v5/step', {
                mode: 'browser',
                method: 'AxiomApiRestartBrowser',
                params: [],
                cdpLink: ''
            })
            .reply(200, 
                {message: 'Step command executed successfully.'}
            )
        const results = await axiomApi.restartBrowser()
        expect(results).toBe('Step command executed successfully.')
    })

});