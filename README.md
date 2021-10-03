<h1 align="center">Welcome to eth-block-datetime 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/npm/v/eth-block-datetime" />
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/matmertz25/eth-block-datetime#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/matmertz25/eth-block-datetime/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/matmertz25/eth-block-datetime/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/matmertz25/eth-block-datetime" />
  </a>
</p>

> Utilities for parsing, validating, manipulating, and displaying Ethereum blocks by date

### 🏠 [Homepage](https://github.com/matmertz25/eth-block-datetime#readme)

## Install

**Npm**
```sh
npm install eth-block-datetime
```

**Yarn**
```sh
yarn add eth-block-datetime
```

## Getting Started

```javascript
import { ethers } from 'ethers'
import EthBlockDatetime from 'eth-block-datetime'

const provider = new ethers.providers.CloudflareProvider()
const ethDatetime = new EthBlockDatetime(
    provider, // [required] rpc provider
)
```
With block explorer for more efficient queries
```javascript 
const ethDatetime = new EthBlockDatetime(
    provider, // [required] rpc provider
    1, // [optional / required if using blockExplorer client] chainId
    'FREE_ETHERSCAN_APIKEY', // [optional] free or pro etherscan api key corresponding to specified chainId
)
```

## Usage

### Providers

**EthersJS**
```javascript
import { ethers } from 'ethers'
```
Public cloudflare ETH RPC
```javascript
const provider = new ethers.providers.CloudflareProvider() // to use public cloudflare ETH RPC
```
Pass in Infura / Alchemy or other Node-as-a-service Eth RPC provider
```javascript
const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL) // to use supplied RPC url
```

**Web3**
```javascript
import Web3 from 'web3'
```
Pass in injected browser web3 object
```javascript
const provider = new Web3(window.ethereum) // to use supplied RPC url
```
Pass in Infura / Alchemy or other Node-as-a-service Eth RPC provider
```javascript
const provider = new Web3(new Web3.providers.HttpProvider(process.env.ETH_RPC_URL)) // to use supplied RPC url
```

### Examples

**Get block by timestamp**
```javascript
const block = await ethBlockDatetime.getBlockByTimestamp({
    timestamp: 'earliest', // [required] options: earliest, latest, timestamp string, momentJs date object, or javascript date object
    closest: 'after', // [optional] after (default), before [estimation method for block closest to timestamp]
    blockTime: 15, // [optional] override average blocktime for finding closest block
    useBlockExplorer: true, // [optional] true (default if chainId & api key is given)
    includeFullBlock: false, // [optiona] false (default) [specify if full block data should be returned]
})
```
Block
```javascript
{
    datetime: '2021-10-03T16:09:28Z',
    number: 13347220,
    timestamp: 1633277292
}
```

**Get blocks by range**
```javascript
let start = new Date()
let end = new Date()
start = new Date(startTime.setDate(startTime.getDate() - 7))
const block = await ethBlockDatetime.getBlockByTimestamp({
    start, // [required] options: earliest, latest, timestamp string, momentJs date object, or javascript date object
    end, // [optional] latest block (default) options: earliest, latest, timestamp string, momentJs date object, or javascript date object
    interval: 'days', // [required] // seconds, minutes, hours, days, weeks, months, years
    duration: 1, // [optional] 1 (default)
    closest: 'after', // [optional] after (default), before [estimation method for block closest to timestamp] 
    includeFullBlock: false, // [optiona] false (default) [specify if full block data should be returned]
})
```

Blocks
```javascript
[
      {
        datetime: '2021-09-26T16:09:28Z',
        number: 13302379,
        timestamp: 1632672551
      },
      {
        datetime: '2021-09-27T16:09:28Z',
        number: 13308801,
        timestamp: 1632758964
      },
      {
        datetime: '2021-09-28T16:09:28Z',
        number: 13315225,
        timestamp: 1632845341
      },
      {
        datetime: '2021-09-29T16:09:28Z',
        number: 13321658,
        timestamp: 1632931728
      },
      {
        datetime: '2021-09-30T16:09:28Z',
        number: 13328031,
        timestamp: 1633018153
      },
      {
        datetime: '2021-10-01T16:09:28Z',
        number: 13334484,
        timestamp: 1633104558
      },
      {
        datetime: '2021-10-02T16:09:28Z',
        number: 13340842,
        timestamp: 1633190949
      },
      {
        datetime: '2021-10-03T16:09:28Z',
        number: 13347220,
        timestamp: 1633277292
      }
]
```


## Run tests

```sh
yarn test
```

## Author

Modified and updated https://github.com/monosux/ethereum-block-by-date to add additional customization and options, dynamic blocktime calculations, and integration with public blockexplorers

👤 **matmertz25**

* Github: [@matmertz25](https://github.com/matmertz25)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/matmertz25/eth-block-datetime/issues). You can also take a look at the [contributing guide](https://github.com/matmertz25/eth-block-datetime/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [matmertz25](https://github.com/matmertz25).<br />
This project is [MIT](https://github.com/matmertz25/eth-block-datetime/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_