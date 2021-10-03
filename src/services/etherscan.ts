import { AxiosInstance, AxiosResponse } from 'axios'
import { baseApiClient } from './baseApiClient'

interface EtherscanResponse {
    status: string
    message: string
    result: any
}

export class EtherscanApi {
    private readonly apiKey: string
    url: string
    client: AxiosInstance

    constructor({blockExplorerUrl, apiKey}: {blockExplorerUrl:string, apiKey: string}) {
        this.apiKey = apiKey
        this.url = blockExplorerUrl
        this.client = baseApiClient(this.url)
    }

    async getBlockNumberByTimestamp(timestamp: number, closest: 'before' | 'after'): Promise<AxiosResponse<EtherscanResponse>> {
        return this.client.get('', {
            params: {
                module: 'block',
                action: 'getblocknobytime',
                timestamp,
                closest,
                apikey: this.apiKey
            }
        })
    }

}