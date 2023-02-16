import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { forEach } from 'lodash'
import Nchan from '~/nchan.1'
import { getMarketActivityStreamingUrl } from '~/api'
import { getOptionStream } from '~/streaming/streaming_business';
import { storePortfolioTotal } from '~s/portfolio/Redux/actions'
import ScreenId from '~/constants/screen_id';
import { setOnDataFunction, setData } from '~/screens/portfolio/Model/StreamingModel.js'
import { func, dataStorage } from '~/storage';
import { errorSettingModel } from '~/screens/setting/main_setting/error_system_setting.js'
import { useTabs } from '~/screens/marketActivity/Views/HeaderFilter.js'
import { getStatusAllowStreaming } from '~/screens/marketActivity/Models/MarketActivityModel.js'
import * as Controller from '~/memory/controller'
const MarketDataStreaming = React.memo(({ navigator, watchlist, exchange, marketGroup }) => {
    const dispatch = useDispatch()
    const dic = useRef({
        nchanConnected: {},
        timeoutSub: null
    })
    const sub = useCallback(() => {
        createConnect({ exchange, marketGroup, watchlist })
    }, [watchlist, exchange, marketGroup])
    const unsub = useCallback(() => {
        forEach(dic.current.nchanConnected, (value, key) => {
            value.close && value.close()
            console.info('unsub', key)
            delete dic.current.nchanConnected[key]
        })
    }, [])
    const onData = useCallback((data = {}) => {
        console.info('MarketDataStreaming', data)
        if (!getStatusAllowStreaming()) return
        data.value && dispatch.marketActivity.changeMarketRealtime({ value: data.value })
        // if (errorSettingModel.code) return
        // setData(data)
        // if (dataStorage.currentScreenId !== ScreenId.PORTFOLIO) return // Kiem tra neu dang o tai man hinh Portfolio thi ms ghi nhan data Streaming. Con case when active lai screenId thi phai getSnapShot
        // data && dispatch(storePortfolioTotal(data))
    }, [])
    const onChangeNetwork = useCallback(() => {

    }, [])
    const onError = useCallback((error) => {
        console.info('MarketDataStreaming onError', error)
    }, [])
    const createConnect = useCallback(({ exchange, marketGroup, watchlist }) => {
        const url = getMarketActivityStreamingUrl({ exchange, marketGroup, watchlist })
        const key = `${exchange}-${marketGroup}-${watchlist}`
        const onConnect = () => {
            dic.current.nchanConnected[key] = newNChan;
            console.info('MarketDataStreaming onConnect', url, exchange, marketGroup, watchlist)
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
    }, [watchlist, exchange, marketGroup])
    useLayoutEffect(() => {
        return () => {
            unsub() // Unmount
        }
    }, [])
    useEffect(() => {
        if (exchange && marketGroup && watchlist && Controller.getAccessToken()) {
            unsub()
            if (dic.current.timeoutSub) clearTimeout(dic.current.timeoutSub)
            dic.current.timeoutSub = setTimeout(sub, 100)
        }
    }, [exchange, marketGroup, watchlist])

    return null
}, (pre, next) => pre.exchange === next.exchange && pre.marketGroup === next.marketGroup && pre.watchlist === next.watchlist)

export default MarketDataStreaming
