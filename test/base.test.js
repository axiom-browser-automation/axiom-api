import { AxiomApi } from '../src/axiom-api.js';
import nock from 'nock';

const scope = nock('https://lar-simon.axiom.ai')
    .post('/api/v5/browser/open')
    .reply(200, {
        endpoint: 'ws://test-cdp-link'
    })

describe('Basic library tests', () => {

    // Basic boostrap test
    test('should bootstrap AxiomApi class', () => {
        const axiomApi = new AxiomApi('test-token');
        expect(axiomApi.token).toBe("test-token");
    });

    test('should open a browser', async () => {
        const axiomApi = new AxiomApi('test-token');
        const cdpLink = await axiomApi.browserOpen();
        expect(cdpLink).toBe('ws://test-cdp-link')
    })

});