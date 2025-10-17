const ENDPOINT = 'https://lar-simon.axiom.ai'

export class AxiomApi {

    constructor(token) {
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

        console.log(content);
        
        return content.endpoint
    }

}