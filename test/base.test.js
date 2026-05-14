import { jest } from '@jest/globals';
import { AxiomApi } from '../src/axiom-api.js';
import { AxiomHttpError } from '../src/axiom-http.js';
import nock from 'nock';

nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
            .post('/api/v5/step')
            .reply(200, {
                message: 'Step command executed successfully.'
            })
        const axiomApi = new AxiomApi('test-token')
        const message = await axiomApi.step('mode', 'method', [])
        expect(message).toBe('Step command executed successfully.')
    })

    test('should scrape data', async () => {
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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
        nock('https://lar.axiom.ai')
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

    describe('long-running step fallback', () => {
        const TEST_CDP_LINK = 'ws://test/devtools/browser/abc'

        // Spy on http.post + _sleep so we can drive the timeout / polling state machine
        // synchronously without burning real seconds on the exponential backoff.
        function makeApi() {
            const api = new AxiomApi('test-token')
            api.cdpLink = TEST_CDP_LINK
            jest.spyOn(api, '_sleep').mockResolvedValue()
            return api
        }

        test('POST timeout falls through to polling, returns the eventual result', async () => {
            const api = makeApi()
            const abortErr = new Error('aborted')
            abortErr.name = 'AbortError'
            const postSpy = jest.spyOn(api.http, 'post')
            postSpy.mockImplementationOnce(() => Promise.reject(abortErr))
            postSpy.mockImplementationOnce(() => Promise.resolve({status: 'running'}))
            postSpy.mockImplementationOnce(() => Promise.resolve({status: 'complete', result: ['scraped', 'data']}))

            const result = await api.step('browser', 'AxiomApiSmartScrapeV440', [], TEST_CDP_LINK)
            expect(result).toStrictEqual(['scraped', 'data'])
            expect(postSpy).toHaveBeenCalledTimes(3)
            expect(postSpy.mock.calls[0][0]).toBe('/api/v5/step')
            expect(postSpy.mock.calls[1][0]).toBe('/api/v5/step/result')
            expect(postSpy.mock.calls[2][0]).toBe('/api/v5/step/result')
        })

        test('409 "Step already in progress" on /step falls through to polling', async () => {
            const api = makeApi()
            const inProgress = new AxiomHttpError(
                'Step already in progress for this session',
                409,
                {status: 'error', message: 'Step already in progress for this session'}
            )
            const postSpy = jest.spyOn(api.http, 'post')
            postSpy.mockImplementationOnce(() => Promise.reject(inProgress))
            postSpy.mockImplementationOnce(() => Promise.resolve({status: 'complete', result: 'ok'}))

            const result = await api.step('browser', 'someMethod', [], TEST_CDP_LINK)
            expect(result).toBe('ok')
        })

        test('step error on the pod surfaces as a thrown error pointing at the task report', async () => {
            const api = makeApi()
            const abortErr = new Error('aborted')
            abortErr.name = 'AbortError'
            const gone = new AxiomHttpError(
                'No running browser session for cdpLink ' + TEST_CDP_LINK,
                409,
                {status: 'error', message: 'No running browser session for cdpLink ' + TEST_CDP_LINK}
            )
            const postSpy = jest.spyOn(api.http, 'post')
            postSpy.mockImplementationOnce(() => Promise.reject(abortErr))
            postSpy.mockImplementationOnce(() => Promise.reject(gone))

            await expect(api.step('browser', 'someMethod', [], TEST_CDP_LINK))
                .rejects.toThrow(/check the task report/)
        })

        test('one-shot step (no cdpLink) does not fall back to polling', async () => {
            const api = makeApi()
            const abortErr = new Error('aborted')
            abortErr.name = 'AbortError'
            const postSpy = jest.spyOn(api.http, 'post')
            postSpy.mockImplementationOnce(() => Promise.reject(abortErr))

            await expect(api.step('browser', 'someMethod', [], ''))
                .rejects.toThrow(/aborted/)
            expect(postSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('wait()', () => {
        test('with a session, routes through /step so the pod resets its inactivity timer', async () => {
            const api = new AxiomApi('test-token')
            api.cdpLink = 'ws://test/devtools/browser/abc'
            const postSpy = jest.spyOn(api.http, 'post')
                .mockResolvedValueOnce({message: 'ok'})

            await api.wait(60_000)

            expect(postSpy).toHaveBeenCalledTimes(1)
            expect(postSpy.mock.calls[0][0]).toBe('/api/v5/step')
            expect(postSpy.mock.calls[0][2]).toEqual({
                mode: 'driver',
                method: 'wait',
                params: [60_000],
                cdpLink: 'ws://test/devtools/browser/abc'
            })
        })

        test('without a session, falls back to a local sleep — no HTTP call', async () => {
            const api = new AxiomApi('test-token')
            const sleepSpy = jest.spyOn(api, '_sleep').mockResolvedValue()
            const postSpy = jest.spyOn(api.http, 'post')

            await api.wait(1234)

            expect(sleepSpy).toHaveBeenCalledWith(1234)
            expect(postSpy).not.toHaveBeenCalled()
        })
    })

});