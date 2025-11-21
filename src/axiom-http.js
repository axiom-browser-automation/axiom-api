const ENDPOINT = 'https://lar.axiom.ai'

export class AxiomHttp {

    async post(uri, token, body) {
        const rawResponse = await fetch(ENDPOINT + uri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-API-KEY': token
            },
            body: JSON.stringify(body)
        });
        if (!rawResponse.ok) {
            let errorContent = await rawResponse.text()
            throw new Error(`HTTP ${rawResponse.status} error: ${errorContent}`);
        }
        const content = await rawResponse.json();
        return content
    }

}