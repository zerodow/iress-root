import { useCallback, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { forEach } from 'lodash'
import Nchan from '~/nchan.1'
import { getOrdersStreamingUrl } from '~/api'
import { getOptionStream } from '~/streaming/streaming_business';
import ScreenId from '~/constants/screen_id';
import { func, dataStorage } from '~/storage';
import { processOrdersRealtime } from '~s/orders/Model/OrdersStreaming'

const FAKE_LIST_ORDER_ID = [6688, 8888, 8999, 9999, 6999, 6666, 6886, 8998, 6699]
const FAKE_LIST_ORDER_TYPE = ['MARKET_TO_LIMIT', 'LIMIT', 'MARKET']
const FAKE_LIST_ORDER_STATE = ['Partially Filled', 'Filled', 'Unfilled']
const FAKE_LIST_ORDER_ACTION = ['Create', 'Amend', 'Cancel', 'Purge']
const FAKE_LIST_ACTION_STATUS = ['OK', 'AUTHORISING', 'PENDING', 'QUEUED', 'DENIED', 'FAILED']
const FAKE_LIST_FILL_STATUS = ['Partially Filled', 'Filled', 'Unfilled']
const FAKE_LIST_ORDER_DESTINATION = ['ASX:TM']
const FAKE_LIST_ORDER_SIDE = ['buy', 'sell']
const FAKE_LIST_ORDER_SYMBOL = ['ANZ', 'BHP', 'NAB', 'MQG']
const FAKE_LIST_ORDER_EXCHANGE = ['ASX']
const FAKE_LIST_ORDER_DURATION = ['GTC']

const randomFloat = (data, key, natural = 1, decimal = 0) => {
    const decimals = 10 * decimal;
    const naturals = 10 * natural;
    const randomNum = Math.floor(Math.random() * (naturals * decimals - 1 * decimals) + 1 * decimals) / (1 * decimals);
    data[key] = randomNum
}

const randomInteger = (data, key, max) => {
    const randomNum = Math.floor(Math.random() * Math.floor(max)); // random from 0 -> max
    data[key] = randomNum
}

const randomByFakeList = (data, key, fakeList) => {
    const randomIndex = Math.floor(Math.random() * fakeList.length);
    data[key] = fakeList[randomIndex]
}

const randomTime = (data, key) => {
    data[key] = new Date().getTime()
}

const randomBoolean = (data, key) => {
    const max = 1
    randomInteger(data, key, max)
}

const fakeData = (accountId, onData) => {
    setTimeout(() => {
        setInterval(() => {
            randomByFakeList(data, 'root_parent_order_id', FAKE_LIST_ORDER_ID)
            randomByFakeList(data, 'symbol', FAKE_LIST_ORDER_SYMBOL)
            randomByFakeList(data, 'exchange', FAKE_LIST_ORDER_EXCHANGE)
            randomByFakeList(data, 'destination', FAKE_LIST_ORDER_DESTINATION)
            randomByFakeList(data, 'duration', FAKE_LIST_ORDER_DURATION)
            randomByFakeList(data, 'side', FAKE_LIST_ORDER_SIDE)
            randomByFakeList(data, 'order_state', FAKE_LIST_ORDER_STATE)
            randomByFakeList(data, 'order_type', FAKE_LIST_ORDER_TYPE)
            randomByFakeList(data, 'order_action', FAKE_LIST_ORDER_ACTION)
            randomByFakeList(data, 'action_status', FAKE_LIST_ACTION_STATUS)
            randomByFakeList(data, 'fill_status', FAKE_LIST_FILL_STATUS)
            randomFloat(data, 'avg_price', 2, 2)
            randomFloat(data, 'limit_price', 2, 2)
            randomFloat(data, 'order_value', 2, 2)
            randomInteger(data, 'filled_quantity', 10000)
            randomInteger(data, 'filled_quantity_percent', 100)
            randomInteger(data, 'remaining_quantity', 10000)
            randomInteger(data, 'order_quantity', 10000)
            randomTime(data, 'entry_time')
            randomTime(data, 'updated')
            randomBoolean(data, 'has_stoploss')
            randomBoolean(data, 'has_takeprofit')
            data.order_id = data.root_parent_order_id
            data.actor_changed = '123ef3'
            data.account_id = accountId
            data.account_name = 'Quant Edge'
            data.stoploss_order_info = {
                stoploss_order_id: 8943857389,
                stoploss_order_status: 'Triggered',
                stoploss_order_filled_quantity: 220,
                stoploss_order_quanity: 222,
                stoploss_order_price: 22.34,
                stoploss_order_value: 5000.55
            }
            data.takeprofit_order_info = {
                takeprofit_order_id: 8943857389,
                takeprofit_order_status: 'Inactive',
                takeprofit_order_filled_quantity: 220,
                takeprofit_order_quantity: 222,
                takeprofit_order_price: 30.34,
                takeprofit_order_value: 5000.55
            }
            onData(data)
        }, 1000)
    }, 3000)
    let data = {}
}

const OrdersStreaming = ({ navigator }) => {
    const accActive = useSelector(state => state.portfolio.accActive)
    const dic = useRef({
        nchanConnected: {}
    })
    const onNavigatorEvent = useCallback((event) => {
        if (event.type === 'NavBarButtonPress') {
            console.log('HandleData NavBarButtonPress')
        } else {
            switch (event.id) {
                case 'didAppear':
                    break;
                case 'didDisappear':
                    break;
                default:
                    break;
            }
        }
    }, [])
    const sub = useCallback(() => {
        // fakeData(accActive, onData)
        createConnect({ accId: accActive })
    }, [accActive])
    const unsub = useCallback(() => {
        forEach(dic.current.nchanConnected, (value, key) => {
            value.close && value.close()
            delete dic.current.nchanConnected[key]
        })
    }, [])
    const onData = useCallback((data) => {
        processOrdersRealtime({ data })
        // setData(data)
        // if (dataStorage.currentScreenId !== ScreenId.PORTFOLIO) return // Kiem tra neu dang o tai man hinh Portfolio thi ms ghi nhan data Streaming. Con case when active lai screenId thi phai getSnapShot
        // data && dispatch(storePortfolioTotal(data))
    }, [])
    const onChangeNetwork = useCallback(() => {

    }, [])
    const onError = useCallback((error) => {
        console.info('ORDERS STREAMING onError', error)
        // console.info('PortfolioStreaming onError', error)
    }, [])
    const createConnect = useCallback(({ accId }) => {
        const url = getOrdersStreamingUrl(accId)
        const onConnect = () => {
            dic.current.nchanConnected[accId] = newNChan;
        };

        const newNChan = new Nchan({
            url,
            fnGetOption: getOptionStream,
            timeout: 20000,
            reconnectTime: 1000,
            onData,
            onConnect,
            onError,
            onChangeNetwork
        });
    }, [accActive])
    useEffect(() => {
        const listener = navigator && navigator.addOnNavigatorEvent(onNavigatorEvent);
        // setOnDataFunction(onData)
        return () => {
            unsub() // Unmount
            listener()
        }
    }, [])
    useEffect(() => {
        unsub() // Change accActive unsub PrevAccActive
        setTimeout(sub, 100) // Change accActive sub newAccActive
    }, [accActive])

    return null
}

export default OrdersStreaming
