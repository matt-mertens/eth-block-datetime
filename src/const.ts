export enum ChainId {
    Ethereum = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Goerli = 5,
    Kovan = 42,
    Optimistic = 10,
    Arbitrum = 42161,
    BSC = 56,
    BSC_Test = 97,
    Polygon = 137,
}        

export const PUBLIC_BLOCKEXPLORER_API_MAPPING = {
    [ChainId.Ethereum]: 'https://api.etherscan.io/api',
    [ChainId.Ropsten]: 'https://api-ropsten.etherscan.io/api',
    [ChainId.Rinkeby]: 'https://api-rinkeby.etherscan.io/api',
    [ChainId.Kovan]: 'https://api-kovan.etherscan.io/api',
    [ChainId.Goerli]: 'https://api-goerli.etherscan.io/api',
    [ChainId.Arbitrum]: 'https://api.arbiscan.io/api',
    [ChainId.Optimistic]: 'https://optimistic.etherscan.io/api',
    [ChainId.BSC]: 'https://api.bscscan.com/api',
    [ChainId.BSC_Test]: 'https://api-testnet.bscscan.com/api',
    [ChainId.Polygon]: 'https://api.polygonscan.com/api',
}