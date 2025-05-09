import axios from 'axios'

export class BackendClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Sends a batch of messages to Azure Event Hubs via the backend API.
     *
     * @param {Array} msgs - An array of messages to be sent to Event Hubs.
     * @returns {Promise<Object>} A promise that resolves to the response data from the backend.
     */
    async sendBatchToEventHubs(msgs) {
        return axios.post(
            `${this.baseUrl}/api/sendBatchToEventHubs`, 
                { 
                    msgs 
                }
            )
            .then(response => response.data)
    }
}