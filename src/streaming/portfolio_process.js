import * as StreamingBusiness from './streaming_business';
import * as Emitter from '@lib/vietnam-emitter';
import * as Util from '../util';
import { dataStorage, func } from '../storage'
import * as cache from '../cache'
import { logDevice } from '../../src/lib/base/functionUtil'

const MyChannel = StreamingBusiness.getChannelPortfolio();

export function process(notiObj) {
    try {
        const newData = JSON.parse(notiObj.object_changed);
        const accountID = newData.account_id
        if (accountID === dataStorage.accountId) {
            // Cache lại order transaction
            const listPosition = newData.positions || []
            if (listPosition.length) {
                // cache.initCacheOrderTransactions(listPosition)
            }
            Emitter.emit(MyChannel, newData);
        }
    } catch (error) {
        logDevice('error', `PROCESS PORTFOLIO EXCEPTION: ${error}`)
        console.log(`PROCESS PORTFOLIO EXCEPTION: ${error}`)
    }
};

export function pubPosition(notiObj) {
    try {
        const newData = JSON.parse(notiObj.object_changed);
        const accountID = newData.account_id
        const symbol = newData.symbol
        if (accountID === dataStorage.accountId && newData) {
            const channel = StreamingBusiness.getChannelPortfolioListPosition(accountID)
            Emitter.emit(channel, newData)
        }
    } catch (error) {
        logDevice('error', `PUB POSITION EXCEPTION: ${error}`)
        console.log(`PUB POSITION EXCEPTION: ${error}`)
    }
}

export function pubBalance(notiObj) {
    try {
        const newData = JSON.parse(notiObj.object_changed);
        const accountID = newData.account_id
        const symbol = newData.symbol
        if (accountID === dataStorage.accountId && newData) {
            const channel = StreamingBusiness.getChannelPortfolioBalance(accountID, symbol)
            Emitter.emit(channel, newData)
        }
    } catch (error) {
        logDevice('error', `pubBalance EXCEPTION: ${error}`)
        console.log(`pubBalance EXCEPTION: ${error}`)
    }
}

export function pubAccountSummary(notiObj) {
    try {
        const newData = JSON.parse(notiObj.object_changed);
        const accountID = newData.account_id
        if (accountID === dataStorage.accountId && newData) {
            const channel = StreamingBusiness.getChannelPortfolioAccountSummary(accountID)
            Emitter.emit(channel, newData)
        }
    } catch (error) {
        logDevice('error', `pubAccountSummary EXCEPTION: ${error}`)
        console.log(`pubAccountSummary EXCEPTION: ${error}`)
    }
}
