import { ethers } from 'ethers'
import Web3 from 'web3'
import moment from 'moment'
const EthBlockDatetime = require('../src/index')
require('dotenv').config()

const ethersProvider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL)
const web3Provider = new Web3(new Web3.providers.HttpProvider(process.env.ETH_RPC_URL))

describe('Eth Block Datetime Tests', function() {
    let ethBlockDatetime: any
    beforeEach(async function() {
        ethBlockDatetime = new EthBlockDatetime(ethersProvider, 1) //, process.env.ETHERSCAN_API_KEY)  
    })

    describe('getBlockByTimestamp()', function() {
        test('get earliest block', async () => {
            let block = await ethBlockDatetime.getBlockByTimestamp({
                timestamp: 'earliest',
            })
            expect(block.number).toBe(1)
        })

        test('throws error if given time is before first block time', async function() {
            try {
                await ethBlockDatetime.getBlockByTimestamp({
                    timestamp: new Date('1961-04-06:07:00Z'),
                })
            } catch (e) {
                expect(e.message).toEqual(`Timestamp is before the earliest block`)
            }
        })

        test('get latest block', async () => {
            const latestBlock = await ethBlockDatetime.provider.eth.getBlockNumber()
            const block = await ethBlockDatetime.getBlockByTimestamp({
                timestamp: 'latest',
            })
            expect(block.number).toBe(latestBlock)
        })

        test('gives latest block if given time is in the future', async function() {
            const latestBlock = await ethBlockDatetime.provider.eth.getBlockNumber()
            const block = await ethBlockDatetime.getBlockByTimestamp({
                timestamp: moment().add(100, 'years').utc(),
            })
            expect(block.number).toBe(latestBlock)
        })

        test('get correct block for a given string', async () => {
            const block = await ethBlockDatetime.getBlockByTimestamp({
                timestamp: '2016-07-20T13:20:40Z',
            })
            expect(block.number).toBe(1920000)
        })

        test('get previous block for a given string', async function() {
            const block = await ethBlockDatetime.getBlockByTimestamp({
                timestamp: '2016-07-20T13:20:38Z',
                current: 'before',
            })
            expect(block.number).toBe(1919999)
        });

        test('get correct block for Date object', async () => {
            const block = await ethBlockDatetime.getBlockByTimestamp({
                timestamp: new Date('2016-07-20T13:20:40Z'),
            })
            expect(block.number).toBe(1920000)
        })

        test('get correct block for Moment object', async () => {
            const block = await ethBlockDatetime.getBlockByTimestamp({
                timestamp: moment(new Date('2016-07-20T13:20:40Z')).utc(),
            })
            expect(block.number).toBe(1920000)
        })

        test('get correct block for miliseconds', async () => {
            const block = await ethBlockDatetime.getBlockByTimestamp({ timestamp: 1469020840000 })
            expect(block.number).toBe(1920000)
        })

        test('get full block data', async () => {
            const block = await ethBlockDatetime.getBlockByTimestamp({ timestamp: 1469020840000, includeFullBlock: true })
            expect(block.number).toBe(1920000)
            expect(block.hash.length).toBeGreaterThan(0)
            expect(block.transactions.length).toBeGreaterThan(0)
        })
    })

    describe('getBlocksByRange()', function() {
        test('get first blocks of years', async function() {
            const blocks = await ethBlockDatetime.getBlocksByRange({
                start: '2017-01-01T00:00:00Z',
                end: '2019-01-01T00:00:00Z',
                interval: 'years'
            })
            const blockNumbers = blocks.map(block => block.number)
            const expected = [2912407, 4832686, 6988615]
            expect(blockNumbers).toEqual(expected)
        })

        test('get last blocks of years', async function() {
            const blocks = await ethBlockDatetime.getBlocksByRange({
                start: '2017-01-01T00:00:00Z',
                end: '2019-01-01T00:00:00Z',
                interval: 'years',
                duration: 1,
                closest: 'before'
            })
            const blockNumbers = blocks.map(block => block.number)
            const expected = [2912406, 4832685, 6988614]
            expect(blockNumbers).toEqual(expected)
        })

        test('get first blocks of week', async function() {
            let startTime = new Date()
            startTime = new Date(startTime.setDate(startTime.getDate() - 7))
            const blocks = await ethBlockDatetime.getBlocksByRange({
                start: startTime,
                interval: 'days',
                duration: 1,
                closest: 'before'
            })
            expect(blocks.length).toBe(8)
        })

        test('returns correct blocks for range', async function() {
            const startTime = moment().subtract(6, 'months')
            const blocks = await ethBlockDatetime.getBlocksByRange({
                start: startTime,
                interval: 'months',
                duration: 1,
            })
            expect(blocks.length).toBe(7)
        })

        test('returns full blocks', async function() {
            const startTime = moment().subtract(6, 'months')
            const blocks = await ethBlockDatetime.getBlocksByRange({
                start: startTime,
                interval: 'months',
                duration: 1,
                includeFullBlock: true
            })
            expect(blocks.length).toBe(7)
            blocks.forEach(block => {
                expect(block.hash.length).toBeGreaterThan(0)
                expect(block.transactions.length).toBeGreaterThan(0)
            })
        })
    })
})