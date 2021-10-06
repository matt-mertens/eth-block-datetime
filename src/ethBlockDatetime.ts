import moment from 'moment'
import { Block, BlockTag, BlockTimestamp } from './types'
import { EtherscanApi } from './services/etherscan'
import { ChainId, PUBLIC_BLOCKEXPLORER_API_MAPPING } from './const'

export default class {
    readonly chainId?: ChainId
    private checkedBlocks
    readonly blocks: { [key: number]: Block }
    provider: { eth: any }
    blockExplorerClient?: EtherscanApi
    earliestBlock?: Block
    latestBlock?: Block
    averageBlockTimeSinceGenesis?: number

    constructor(rpcProvider, chainId?: number, blockExplorerApiKey?: string) {
        this.provider = rpcProvider.constructor.name === 'Web3' ? rpcProvider : { eth: rpcProvider }
        this.chainId = chainId
        this.blockExplorerClient = blockExplorerApiKey && chainId ? new EtherscanApi({
            blockExplorerUrl: PUBLIC_BLOCKEXPLORER_API_MAPPING[chainId],
            apiKey: blockExplorerApiKey
        }) : undefined
        this.blocks = {}
        this.checkedBlocks = {}
    }

    async getBlock(blockTag: number | BlockTag): Promise<Block> {
        let blockNumber: number
        if (blockTag == 'latest') {
            blockNumber = await this.provider.eth.getBlockNumber()
        } else {
            blockNumber = blockTag == 'earliest' ? 1 : blockTag
        }

        if (this.blocks[blockNumber]) return this.blocks[blockNumber]
        const block: Block = await this.provider.eth.getBlock(blockNumber)
        this.blocks[blockNumber] = block
        return block
    }

    async getBlockchainBoundaries() {
        if (this.earliestBlock || this.latestBlock || typeof this.averageBlockTimeSinceGenesis == 'undefined') {
            this.earliestBlock = await this.getBlock(BlockTag.Earliest)
            this.latestBlock = await this.getBlock(BlockTag.Latest)
            const timeSinceGenesisBlock = moment.unix(this.latestBlock.timestamp).diff(moment.unix(this.earliestBlock.timestamp), 'seconds')
            this.averageBlockTimeSinceGenesis = (timeSinceGenesisBlock / this.latestBlock.number)
        }
        return { 
            earliestBlock: this.earliestBlock,
            latestBlock: this.latestBlock,
            averageBlockTimeSinceGenesis: this.averageBlockTimeSinceGenesis
        }
    }

    getAverageBlockTime(startingBlock: Block, endingBlock: Block) {
        const timeBetweenRange = moment.unix(endingBlock.timestamp).diff(moment.unix(startingBlock.timestamp), 'seconds')
        const averageBlockTime = (timeBetweenRange / (endingBlock.number - startingBlock.number))
        return averageBlockTime
    }

    getFormattedBlockDatetime(datetime, block, includeFullBlock=false) {
        if (includeFullBlock) {
            return { datetime, ...block }
        }
        return { datetime, number: block.number, timestamp: block.timestamp }
    }

    async isClosestBlock(timestamp, predictedBlock, closest: 'after' | 'before' = 'after') {
        let predictedBlockTimestamp = moment.unix(predictedBlock.timestamp)
        if (closest === 'after') {
            if (predictedBlockTimestamp.isBefore(timestamp)) return false
            let previousBlock = await this.getBlock(predictedBlock.number - 1)
            if (predictedBlockTimestamp.isSameOrAfter(timestamp) &&moment.unix(previousBlock.timestamp).isBefore(timestamp)) return true
        } else {
            if (predictedBlockTimestamp.isSameOrAfter(timestamp)) return false
            let nextBlock = await this.getBlock(predictedBlock.number + 1)
            if (predictedBlockTimestamp.isBefore(timestamp) && moment.unix(nextBlock.timestamp).isSameOrAfter(timestamp)) return true
        }
        return false
    }

    getNextBlock(timestamp, currentBlock, skip) {
        let nextBlock = currentBlock + skip
        if (this.checkedBlocks[timestamp.unix()].includes(nextBlock)) return this.getNextBlock(timestamp, currentBlock, (skip < 0 ? --skip : ++skip))
        this.checkedBlocks[timestamp.unix()].push(nextBlock)
        return nextBlock < 1 ? 1 : nextBlock
    }

    async checkForCloserBlock(
        timestamp,
        predictedBlock,
        closest: 'after' | 'before' = 'after',
        blockTime = this.averageBlockTimeSinceGenesis
    ) {
        // if the predicted block is the closest block return the block
        if (await this.isClosestBlock(timestamp, predictedBlock, closest)) return predictedBlock

        // if the block is not the closest block, find the closest block
        let difference = timestamp.diff(moment.unix(predictedBlock.timestamp), 'seconds')
        let skip = Math.ceil(difference / blockTime)
        if (skip == 0) skip = difference < 0 ? -1 : 1
        let nextPredictedBlock = await this.getBlock(this.getNextBlock(timestamp, predictedBlock.number, skip))
        blockTime = Math.abs(
            (predictedBlock.timestamp - nextPredictedBlock.timestamp) /
            (predictedBlock.number - nextPredictedBlock.number)
        );
        return this.checkForCloserBlock(timestamp, nextPredictedBlock, closest, blockTime)
    }

    async getBlockByTimestamp({
        timestamp,
        closest = 'after',
        blockTime = this.averageBlockTimeSinceGenesis,
        useBlockExplorer = !!this.blockExplorerClient,
        includeFullBlock = false,
    }: {
        timestamp: any,
        closest?: 'after' | 'before',
        blockTime?: number | undefined,
        useBlockExplorer?: boolean,
        includeFullBlock?: boolean,
    }): Promise<BlockTimestamp> {
        // if timestamp is 'latest' or  'earliest' return the block directly
        if (Object.values(BlockTag).includes(timestamp)) {
            const block = await this.getBlock(timestamp)
            return this.getFormattedBlockDatetime(moment.unix(block.timestamp).utc().format(), block, includeFullBlock)
        }
        // if timestamp is a number convert to moment date object
        if (!moment.isMoment(timestamp)) timestamp = moment(timestamp).utc()
        // if blockExplorerClient is defined use it to get fetch block number by timestamp
        if (this.blockExplorerClient && useBlockExplorer) {
            const { data } = await this.blockExplorerClient.getBlockNumberByTimestamp(timestamp.unix(), closest)
            const blockNumber = parseInt(data.result)
            let block
            if (data.result.includes('too far in the future')) {
                const { latestBlock } = await this.getBlockchainBoundaries()
                block = latestBlock
            } else {
                block = await this.getBlock(blockNumber)
            }
            
            return this.getFormattedBlockDatetime(
                timestamp.format(),
                block,
                includeFullBlock
            )
        }

        // if blockExplorerClient is not defined use the provider to get block number by timestamp
        const { earliestBlock, latestBlock, averageBlockTimeSinceGenesis } = await this.getBlockchainBoundaries()
        if (timestamp.isBefore(moment.unix(earliestBlock.timestamp))) throw new Error(`Timestamp is before the earliest block`)
        if (timestamp.isAfter(moment.unix(latestBlock.timestamp))) return this.getFormattedBlockDatetime(
            timestamp.format(),
            latestBlock,
            includeFullBlock,
        )

        this.checkedBlocks[timestamp.unix()] = []
        // if blockExplorerClient is not defined and timestamp is between earliest and latest block predict the block number
        const predictedBlockNumber = Math.ceil(
            timestamp.diff(moment.unix(earliestBlock.timestamp), 'seconds') / averageBlockTimeSinceGenesis,
        )
        let predictedBlock = await this.getBlock(predictedBlockNumber)
        return this.getFormattedBlockDatetime(
            timestamp.format(),
            await this.checkForCloserBlock(timestamp, predictedBlock, closest, blockTime),
            includeFullBlock
        )
    }

    async getBlocksByRange({
        start,
        end = new Date(),
        interval,
        duration = 1,
        closest = 'after',
        includeFullBlock = false,
    }: {
        start: any,
        end: any,
        interval: string,
        duration,
        closest: 'after' | 'before',
        includeFullBlock: boolean,
    }): Promise<BlockTimestamp[]> {
        let timestamps: number[] = []
        if (!moment.isMoment(start)) start = moment(start)
        if (!moment.isMoment(end)) end = moment(end)
        let current = start
        // build array of timestamps by interval and duration
        while (current.isSameOrBefore(end)) {
            timestamps.push(current.format())
            current.add(duration, interval)
        }
        // fetch blockchains boundaries
        const { averageBlockTimeSinceGenesis } = await this.getBlockchainBoundaries()
        let averageBlockTime = averageBlockTimeSinceGenesis
        const firstBlock = await this.getBlockByTimestamp({
            timestamp: timestamps[0],
            closest,
        })
        const lastBlock = await this.getBlockByTimestamp({
            timestamp: timestamps[timestamps.length - 1],
            closest,
        })
        averageBlockTime = this.getAverageBlockTime(firstBlock, lastBlock)
        // fetch blocks by timestamps in range
        return await Promise.all(timestamps.map((timestamp) => this.getBlockByTimestamp({
                    timestamp,
                    closest,
                    blockTime: averageBlockTime,
                    useBlockExplorer: false,
                    includeFullBlock,
                })
            )
        )
    }
}
