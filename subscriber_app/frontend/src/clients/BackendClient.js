import axios from 'axios'

export class BackendClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async query(query, params) {
        return axios.get(
            `${this.baseUrl}/api/query`, 
            {
                params: { 
                    query,
                    params: JSON.stringify(params) 
                }
            }
        )
        .then(response => response.data)
    }
}