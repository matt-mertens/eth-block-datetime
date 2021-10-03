// "latest" - The most recently mined block
// "earliest" - Block #0
export enum BlockTag {
    Latest = 'latest',
    Earliest = 'earliest',
}

export interface Block {
    hash?: string
    parentHash?: string
    number: number
    timestamp: number
    nonce?: string
    difficulty?: number
    gasLimit?: string
    gasUsed?: string
    miner?: string
    extraData?: string
    baseFeePerGas?: null | string
}

export interface BlockTimestamp extends Block {
    datetime: string
}