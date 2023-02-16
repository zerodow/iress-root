import * as Req from '../network/http/request'
import * as Controller from '../memory/controller'
import * as Channel from '../streaming/channel'
import Enum from '../enum'
import * as Emitter from '@lib/vietnam-emitter'
import { dataStorage as DataStorage } from '../storage'
import { setResolveAfterLoading } from '~/lib/base/functionUtil'
import * as StreamingBusiness from '~/streaming/streaming_business';
import { getChannelRealtimeHolding, getChannelRealtimeSummary, getChannelTransactionChange } from '~/streaming/channel'
import { getPortfolioByMktPriceStreamingUrl } from '~/api'
import { dataStorage } from '~/storage'
import * as Business from '~/business'
import Nchan from '~/nchan.1';

const REQ_KEY = Enum.REQ_KEY
const STREAMING_TYPE = {
    SUMMARY: 'accountsummary',
    HOLDING: 'portfolio',
    TRANSACTION: 'TRANSACTION'
}
const STREAMING_ACTION = {
    UPDATE: 'UPDATE',
    CREATE: 'CREATE',
    DELETE: 'DELETE'
}

let timeout = null
let timeInterval = null

const range = {
    minPrice: -1,
    maxPrice: 1
}

const rangeVolume = {
    minVolume: 0,
    maxVolume: 1000
}
const { minPrice, maxPrice } = range
const { minVolume, maxVolume } = rangeVolume

const listSymbol = [
    'CLEK20.XNYM',
    'CLEK30.XNYM',
    'CLEK40.XNYM',
    'CLEK50.XNYM'
]

const arrKeyHolding = [
    'upnl',
    'profit_percent',
    'today_change_val',
    'today_change_percent',
    'average_price',
    'volume',
    'book_value_convert',
    'book_value',
    'value_convert',
    'value',
    'side'
]

const arrKeySummary = [
    'account_balance',
    'total_today_change_amount',
    'total_today_change_percent',
    'total_profit_amount',
    'total_profit_percent',
    'available_balance_au',
    'cash_balance',
    'total_market_value',
    'securities_at_cost',
    'open_order',
    'sell_open_order',
    'pending_settlement',
    'pending_settlement_t0',
    'pending_settlement_t1',
    'pending_settlement_t2',
    'pending_settlement_tother'
]

let nchanObj = {}

const fakeSummaryData = {
    id: 'operation',
    type: 'operation',
    data: {
        title: 'accountsummary#UPDATE#{"account_id":"579998F"}',
        notification_id: 'operation_579998F_accountsummary_1583231749665',
        body: '',
        object_changed: '{"account_id":"579998F","account_name":"DEMO EQ ACCOUNT 10000","total_market_value":0,"cash_balance":0,"securities_at_cost":0,"total_profit_amount":0,"total_profit_percent":0,"cash_available":0,"cash_available_au":0,"cash_available_us":0,"available_balance":0,"cash_balance_after_settlement":0,"account_balance":0,"total_today_change_amount":0,"total_today_change_percent":0,"future_open_order_fee":0,"futures_cost_to_close":0,"equities_cost_to_close":0,"cost_to_close":0,"pl_of_margin":0,"pl_of_margin_lme":0,"value_of_position":0,"account_value":0,"not_available_as_margin_collateral":0,"initial_margin_available":0,"maintenance_margin_available":0,"initial_margin_impact":0,"initial_margin_impact_convert":0,"initial_margin_reserved":0,"initial_margin_reserved_convert":0,"maintenance_margin_reserved":0,"maintenance_margin_reserved_convert":0,"margin_utilisation":0,"margin_ratio":0,"max_withdrawal_amount":0,"cash_at_bank":0,"pending_buy_order":0,"pending_sell_order":0,"pending_settlement":0,"pending_settlement_t0":0,"pending_settlement_t1":0,"pending_settlement_t2":0,"pending_settlement_tother":0,"pending_settlement_future":0,"margin_level":"40.00","margin_type":0,"status":null}'
    }
}

const fakeHoldingData = {
    id: 'operation',
    type: 'operation',
    data:
    {
        title: 'portfolio#UPDATE#{"account_id":727002,"symbol":"CLEK20.XNYM"}',
        notification_id: 'operation_727002_CLEK20.XNYM_portfolio_1583290122515',
        body: '',
        object_changed: '{"account_id":"266485","symbol":"CLEK20.XNYM","exchange":"XNYM","currency":"USD","style":"Future","volume":1,"updated":1585709716529,"average_price":53.92,"book_cost":53920,"book_value":53920,"group_code":"CLEK20.XNYM","type":"FUTURE","symbolKey":"CLEK20.XNYM","display_name":"CLEK20.NYMEX","company_name":"","master_code":"CLE.XNYM","previous_close":51.5,"commodity_info":{"symbol":"CLE.XNYM","class":"Future","initial_margin":4411,"maintenance_margin":4010,"overnight_margin":0,"contract_size":1000,"multiplier":1,"unit":"bushel","currency":"USD","tick_size":0.01,"time_zone":"(GMT- 05:00) Eastern Time (from the 1st Sunday in November every year) - (GMT- 04:00) Eastern Time (from the 2nd Sunday in March every year)","trading_hours":"Sunday - Friday, 6:00 p.m. - 5:00 p.m","list_contract":["1"," 2"," 3"," 4"," 5"," 6"," 7"," 8"," 9"," 10"," 11"," 12"],"time_changed":1559277998219},"min":47.96,"max":47.96,"trend":"None","cost":53.92,"today_change_val":-3.54,"today_change_percent":-0.06873786407766991,"previous_value":51.5,"value":47960,"profit_percent":-0.11053412462908012,"upnl":-0.2571182053494392,"value_convert":1111712800,"book_cost_convert":2.3261432269197586,"book_value_convert":1249865600,"rate":{"rate":23180,"operator":"*"},"market_price":47.96,"side":"Buy","id":"727002:CLEK20.XNYM","initial_margin":4411,"maintenance_margin":4010,"overnight_margin":0,"contract_size":1000}'
    }
}
const fakeObjectRealtimePositionLME = {
    id: 'operation',
    type: 'operation',
    data: {
        title: 'portfolio#UPDATE#{"account_id":"111001","symbol":"LALZ.XLME","group_code":"AHDD24M20.XLME"}',
        notification_id: 'operation_111001_AHDD24M20.XLME_portfolio_1585551294467',
        body: '',
        object_changed: '{"account_id":"266485","symbol":"LALZ.XLME","average_price":1570.5,"cost":1570.5,"currency":"USD","exchange":"XLME","style":"Future","updated":1585551283352,"volume":1,"book_value":39262.5,"book_cost":1570.5,"side":"Buy","group_code":"AHDD24M20.XLME","type":"FUTURE","symbolKey":"LALZ.XLME","display_name":"LALZ(AHDD24M20).XLME","company_name":"","master_code":null,"country":"US","trading_halt":0,"display_exchange":"LME","security_name":"ALUMINIUM(LME) 24 JUN 20","class":"future","previous_close":1582,"commodity_info":{"symbol":"LALZ.XLME","class":"Future","initial_margin":3075,"maintenance_margin":3075,"overnight_margin":0,"contract_size":25,"multiplier":1,"unit":"ton","currency":"USD","tick_size":0.5,"time_zone":"(GMT) British Time - London(from the last Sunday in October every year) - (GMT + 01: 00) British Time - London(from the last Sunday in March every year)","trading_hours":"Sunday - Friday, 01: 00 a.m - 07: 00 p.m","list_contract":"Daily: out to 3 Months","time_changed":1584497746779},"min":1533.5,"max":1533.5,"initial_margin":3075,"maintenance_margin":3075,"overnight_margin":0,"contract_size":25,"market_price":1533.5,"today_change_val":-48.5,"today_change_percent":-0.03065739570164349,"previous_value":1582,"value":38337.5,"profit_percent":-0.02355937599490608,"upnl":-21880875,"value_convert":906873562.5,"book_cost_convert":0.06639188332276474,"book_value_convert":928754437.5,"rate":{"rate":23655,"operator":" * "},"id":"111001: AHDD24M20.XLME"}'
    }
}
const fakeObjectRealtimeTransactionLME = {

}
function createReqKeyPortfolio() {
    return `${REQ_KEY.GET_PORTFOLIO}_${Controller.getAccountId()}`
}

export function reqPortfolioData(forceReq, setMinTimeToLoading) {
    const timeStartRequest = new Date().getTime();
    return new Promise((resolve, reject) => {
        const reqKey = createReqKeyPortfolio()
        Controller.setStatusReqSending(reqKey)

        const accountId = Controller.getAccountId()
        Req.getPortfolio(accountId)
            .then(data => {
                setResolveAfterLoading(setMinTimeToLoading, timeStartRequest, () => {
                    Controller.setPortfolio(data, forceReq)
                    Controller.setStatusReqResponse(reqKey, data, true)
                    resolve(data);
                })
            })
            .catch(err => {
                Controller.setStatusReqResponse(reqKey, err, false)
                reject(err)
            })
    })
}

export function getPortfolio({ forceReq = false, setMinTimeToLoading = false }) {
    if (forceReq === false) {
        const portfolioData = Controller.getCachePortfolio()
        if (Controller.isPriceStreaming() && portfolioData && Object.keys(portfolioData).length > 0) {
            return Promise.resolve(portfolioData)
        }
    }

    const reqKey = createReqKeyPortfolio()
    const isRequesting = Controller.checkIsReqSending(reqKey)
    return new Promise((resolve, reject) => {
        if (isRequesting) {
            Controller.pushToListFuncWaitRes(reqKey, resolve, reject)
        } else {
            reqPortfolioData(forceReq, setMinTimeToLoading).then(resolve).catch(reject)
        }
    })
}

function fakeSummary() {
    try {
        const { data } = fakeSummaryData
        const { title, object_changed: objectChanged } = data
        const realtimeData = JSON.parse(objectChanged)
        arrKeySummary.map((item, index) => {
            const randomDistance = Math.random() * (maxPrice - minPrice) + minPrice
            realtimeData[item] = realtimeData[item] + randomDistance
        })
        /*
            1. account_balance
            2. total_today_change_amount
            3. total_today_change_percent
            4. total_profit_amount
            5. total_profit_percent
            6. available_balance_au
            7. cash_balance
            8. total_market_value
            9. securities_at_cost
            10. open_order
            11. sell_open_order
            12. pending_settlement
            13. pending_settlement_t0
            14. pending_settlement_t1
            15. pending_settlement_t2
            16. pending_settlement_tother
        */
        onSummaryData(realtimeData)
    } catch (error) {

    }
}

function fakeHolding() {
    try {
        const { data } = fakeHoldingData
        const { title, object_changed: objectChanged } = data
        const realtimeData = JSON.parse(objectChanged)
        const randomIndexSymbol = Math.floor(Math.random() * (listSymbol.length - 1 - 0 + 1) + 0)
        const symbol = listSymbol[randomIndexSymbol]
        realtimeData['symbol'] = symbol
        arrKeyHolding.map((item, index) => {
            const randomDistance = Math.random() * (maxPrice - minPrice) + minPrice
            const randomVolumeDistance = Math.floor(Math.random() * (maxVolume - minVolume + 1) + minVolume)
            switch (item) {
                case 'side':
                    const side = Math.random() >= 0.5
                        ? 'Buy'
                        : 'Sell'
                    realtimeData[item] = side
                    break;
                case 'volume':
                    realtimeData[item] = realtimeData[item] + randomVolumeDistance
                    break;
                default:
                    realtimeData[item] = realtimeData[item] + randomDistance
                    break;
            }
        })
        /*
            1. upnl
            2. profit_percent
            3. today_change_val
            4. today_change_percent
            5. average_price
            6. volume
            7. book_value_convert
            8. book_value
            9. value_convert
            10. value
            11. size - Enum.SIDE_POSITION.BUY
        */
        onHoldingData(realtimeData)
    } catch (error) {
        console.log('fakeHolding error', error)
    }
}

function fakeAll() {
    unFakeAll()
    timeout = setTimeout(() => {
        timeInterval = setInterval(() => {
            fakeHolding()
            fakeSummary()
        }, 1 * 1000)
    }, 3 * 1000)
}

function unFakeAll() {
    timeout && clearTimeout(timeout)
    timeInterval && clearInterval(timeInterval)
}

function onSummaryData(data) {
    const { account_id: accountId } = data
    if (accountId && accountId !== dataStorage.accountId) return // Không trùng account ko ghi nhận realtime
    const isPubData = false
    data.available_balance_au = data.cash_available_au // Do không muốn thay đổi quá nhiều field trong dữ liệu trả về nên c2r sẽ là available_balance_us và available_balance_au còn realtime sẽ là cash_available_au và cash_available_us
    data.available_balance_us = data.cash_available_us
    Controller.updateCashBalance(data, isPubData)
    const channel = getChannelRealtimeSummary()
    Emitter.emit(channel)
}

function onHoldingData(data) {
    const { account_id: accountId } = data
    if (accountId && accountId !== dataStorage.accountId) return // Không trùng account ko ghi nhận realtime
    const isPubData = false
    Controller.updatePosition(data, isPubData)
    const channel = getChannelRealtimeHolding()
    Emitter.emit(channel)
}

function onTransactionData(data) {
    const { symbol, account_id: accountId } = data
    if (!symbol) return
    if (accountId && accountId !== dataStorage.accountId) return // Không trùng account ko ghi nhận realtime
    const keySymbol = Business.getSpecificSymbol(data)
    data.isTransaction = true
    const channel = getChannelTransactionChange(keySymbol)
    Emitter.emit(channel, data)
}

/* SUB STREAMING PORTFOLIO */
export function sub(stringQueryAcc) {
    if (!stringQueryAcc) {
        stringQueryAcc = dataStorage.accountId
    }
    return connectNchan(stringQueryAcc)
    // return fakeAll()
}

export function unsub(stringQueryAcc) {
    return new Promise(resolve => {
        if (!stringQueryAcc) {
            stringQueryAcc = dataStorage.accountId
        }

        nchanObj[stringQueryAcc] && nchanObj[stringQueryAcc].map(item => {
            item && item.close && item.close();
        });
        nchanObj[stringQueryAcc] = [];
        return resolve();
    })
    // return unFakeAll()
}
export function fakeRealtimePosition() {
    try {
        const randomQuanty = Math.floor(Math.random() * 100)
        const randomKeySymbol = Math.floor(Math.random() * 2)
        const listKeySymbol = [
            'AHDD24M20.XLME',
            'AHDD30M20.XLME'
        ]
        const { data } = fakeObjectRealtimePositionLME
        const { title, object_changed: objectChanged } = data
        const newData = JSON.parse(objectChanged)
        newData.group_code = listKeySymbol[randomKeySymbol]
        newData.volume = randomQuanty
        newData.display_name = `LALZ ${listKeySymbol[randomKeySymbol]}`
        newData.side = Math.random() >= 0.5
            ? 'Buy'
            : 'Sell'
        // const newData = {
        //     'account_id': '111001',
        //     'symbol': `LALZ.XLME`,
        //     'average_price': 1570.5,
        //     'cost': 1570.5,
        //     'currency': 'USD',
        //     'exchange': 'XLME',
        //     'style': 'Future',
        //     'updated': 1585551283352,
        //     'volume': randomQuanty,
        //     'book_value': 39262.5,
        //     'book_cost': 1570.5,
        //     'side': 'Buy',
        //     'group_code': `AHDD24M20.XLME`,
        //     'type': 'FUTURE',
        //     'symbolKey': 'LALZ.XLME',
        //     'display_name': `LALZ (AHDD24M20).XLME`,
        //     'company_name': '',
        //     'master_code': null,
        //     'country': 'US',
        //     'trading_halt': 0,
        //     'display_exchange': 'LME',
        //     'security_name': 'ALUMINIUM (LME) 24 JUN 20',
        //     'class': 'future',
        //     'previous_close': 1582,
        //     'commodity_info': {
        //         'symbol': 'LALZ.XLME',
        //         'class': 'Future',
        //         'initial_margin': 3075,
        //         'maintenance_margin': 3075,
        //         'overnight_margin': 0,
        //         'contract_size': 25,
        //         'multiplier': 1,
        //         'unit': 'ton',
        //         'currency': 'USD',
        //         'tick_size': 0.5,
        //         'time_zone': '(GMT) British Time - London (from the last Sunday in October every year) - (GMT+01:00) British Time - London (from the last Sunday in March every year)',
        //         'trading_hours': 'Sunday - Friday, 01:00 a.m - 07:00 p.m',
        //         'list_contract': 'Daily: out to 3 Months',
        //         'time_changed': 1584497746779
        //     },
        //     'min': 1533.5,
        //     'max': 1533.5,
        //     'initial_margin': 3075,
        //     'maintenance_margin': 3075,
        //     'overnight_margin': 0,
        //     'contract_size': 25,
        //     'market_price': 1533.5,
        //     'today_change_val': -48.5,
        //     'today_change_percent': -0.03065739570164349,
        //     'previous_value': 1582,
        //     'value': 38337.5,
        //     'profit_percent': -0.02355937599490608,
        //     'upnl': -21880875,
        //     'value_convert': 906873562.5,
        //     'book_cost_convert': 0.06639188332276474,
        //     'book_value_convert': 928754437.5,
        //     'rate': {
        //         'rate': 23655,
        //         'operator': '*'
        //     },
        //     'id': '111001:AHDD24M20.XLME'
        // }
        const type = STREAMING_TYPE.HOLDING
        // const newData = JSON.parse(objectChanged)
        switch (type) {
            case STREAMING_TYPE.HOLDING:
                return onHoldingData(newData)
            case STREAMING_TYPE.SUMMARY:
                return onSummaryData(newData)
            case STREAMING_TYPE.TRANSACTION:
                return onTransactionData(newData)
            default:
                break;
        }
    } catch (error) {
        console.log('onData PORTFOLIO EXCEPTION', error)
    }
}
export function fakeRealTimeTransaction() {
    const count = Math.floor(Math.random() * 10)
    try {
        const newData = {
            'account_id': '111001',
            'broker_order_id': '1080287123',
            'id': `156258129664${count}`,
            'group_code': 'AHDD30M20.XLME',
            'trading_market': 'XLME',
            'style': 'Future',
            'trade_date': 1585057826194,
            'gross_amount': 1570.5,
            'net_amount': 1570.5,
            'settlement_amount': null,
            'currency': 'USD',
            'price': 1570.5,
            'volume': 1,
            'fees': 0,
            'updated': 1585057826440,
            'business_date': 1585008000000,
            'client_order_id': '111001_8cbc7957d07d44eabad80f520',
            'is_buy': '1',
            'bid': 1,
            'ask': 1,
            'rate': {
                'rate': 23655,
                'operator': '*'
            },
            'symbol': 'LALZ.XLME',
            'exchange': 'XLME',
            'market_price': 1533.5,
            'side': 'Buy',
            'quantity': 1,
            'book_value': 39262.5,
            'book_value_convert': 928754437.5,
            'value': 38337.5,
            'value_convert': 906873562.5,
            'upnl': -21880875,
            'today_change_percent': -0.03065739570164349,
            'profit_percent': -0.02355937599490608,
            'today_change_val': -48.5,
            'typePosition': 'FUTURE'
        }
        const type = STREAMING_TYPE.TRANSACTION
        // const newData = JSON.parse(objectChanged)
        switch (type) {
            case STREAMING_TYPE.HOLDING:
                return onHoldingData(newData)
            case STREAMING_TYPE.SUMMARY:
                return onSummaryData(newData)
            case STREAMING_TYPE.TRANSACTION:
                return onTransactionData(newData)
            default:
                break;
        }
    } catch (error) {
        console.log('onData PORTFOLIO EXCEPTION', error)
    }
}
function onData(realtimeData) {
    try {
        console.log('DCM onData portfolio', realtimeData)
        const { data, ping } = realtimeData
        if (ping) return
        const {
            title,
            object_changed: objectChanged
        } = data
        const arrTitle = title.split('#')
        const type = arrTitle[0]
        const newData = JSON.parse(objectChanged)
        switch (type) {
            case STREAMING_TYPE.HOLDING:
                return onHoldingData(newData)
            case STREAMING_TYPE.SUMMARY:
                return onSummaryData(newData)
            case STREAMING_TYPE.TRANSACTION:
                return onTransactionData(newData)
            default:
                break;
        }
    } catch (error) {
        console.log('onData PORTFOLIO EXCEPTION', error)
    }
}

function onChangeNetwork() {

}

const connectNchan = (stringQueryAcc) => {
    return new Promise(resolve => {
        const onConnect = () => {
            console.log('DCM onConnect')
            nchanObj[stringQueryAcc] = nchanObj[stringQueryAcc] || [];
            nchanObj[stringQueryAcc].push(newNchanObj);
            resolve();
        }
        const newNchanObj = new Nchan({
            url: getPortfolioByMktPriceStreamingUrl(stringQueryAcc),
            fnGetOption: StreamingBusiness.getOptionStream,
            onData,
            timeout: 20000,
            reconnectTime: 1000,
            onConnect,
            onError: () => {
                console.log('DCM onError')
                resolve();
            },
            onChangeNetwork
        });
    });
};
