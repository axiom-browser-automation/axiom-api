import { ENDPOINT } from "./config.js"

export class AxiomHttpError extends Error {
    constructor(message, status, body) {
        super(message)
        this.name = 'AxiomHttpError'
        this.status = status
        this.body = body
    }
}

export class AxiomHttp {

    async post(uri, token, body, options = {}) {
        const controller = new AbortController()
        let timeoutId = null
        if (options.timeoutMs && options.timeoutMs > 0) {
            timeoutId = setTimeout(() => controller.abort(), options.timeoutMs)
        }
        let rawResponse
        try {
            rawResponse = await fetch(ENDPOINT + uri, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-API-KEY': token
                },
                body: JSON.stringify(body),
                signal: controller.signal
            })
        } finally {
            if (timeoutId) clearTimeout(timeoutId)
        }
        if (!rawResponse.ok) {
            const errorText = await rawResponse.text()
            let parsed = null
            try { parsed = JSON.parse(errorText) } catch (_) { /* non-JSON body */ }
            if (rawResponse.status === 401) {
                throw new AxiomHttpError("Failed to authenticate - please check your token.", 401, parsed)
            }
            const msg = (parsed && parsed.message) ? parsed.message : `HTTP ${rawResponse.status} error: ${errorText}`
            throw new AxiomHttpError(msg, rawResponse.status, parsed)
        }
        return rawResponse.json()
    }

}
