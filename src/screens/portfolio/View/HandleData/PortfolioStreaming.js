import { useCallback, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { forEach } from 'lodash'
import Nchan from '~/nchan.1'
import { getPortfolioStreamingUrl } from '~/api'
import { getOptionStream } from '~/streaming/streaming_business';
import { getAccessMode, getAccActive } from '~/screens/portfolio/Model/PortfolioAccountModel.js'
import { storePortfolioTotal } from '~s/portfolio/Redux/actions'
import ScreenId from '~/constants/screen_id';
import { setOnDataFunction, setData } from '~/screens/portfolio/Model/StreamingModel.js'
import { func, dataStorage } from '~/storage';
import { errorSettingModel } from '~/screens/setting/main_setting/error_system_setting.js'
const PortfolioStreaming = ({ navigator }) => {
    const accActive = useSelector(state => state.portfolio.accActive)
    const dispatch = useDispatch()
    const dic = useRef({
        nchanConnected: {},
        timeoutSub: null
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
        createConnect({ accId: accActive })
    }, [accActive])
    const unsub = useCallback(() => {
        if (dic.current.timeoutSub) clearTimeout(dic.current.timeoutSub)
        forEach(dic.current.nchanConnected, (value, key) => {
            value.close && value.close()
            delete dic.current.nchanConnected[key]
        })
    }, [])

    const onData = useCallback((data) => {
        if (errorSettingModel.code) return
        setData(data)
        if (dataStorage.currentScreenId !== ScreenId.PORTFOLIO || (data && data.portfolio_id !== getAccActive())) return // Kiem tra neu dang o tai man hinh Portfolio thi ms ghi nhan data Streaming. Con case when active lai screenId thi phai getSnapShot. hoac la message khong con dung account
        data && dispatch(storePortfolioTotal(data))
    }, [])
    const onChangeNetwork = useCallback(() => {

    }, [])
    const onError = useCallback((error) => {
        // console.info('PortfolioStreaming onError', error)
    }, [])
    const createConnect = useCallback(({ accId }) => {
        const url = getPortfolioStreamingUrl(accId)
        const onConnect = () => {
            dic.current.nchanConnected[accId] = newNChan;
            // console.info('PortfolioStreaming onConnect', url)
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
        setOnDataFunction(onData)
        return () => {
            unsub() // Unmount
            listener()
        }
    }, [])
    useEffect(() => {
        unsub() // Change accActive unsub PrevAccActive
        if (dic.current.timeoutSub) clearTimeout(dic.current.timeoutSub)
        dic.current.timeoutSub = setTimeout(sub, 0.2 * 1000) // Change accActive sub newAccActive
    }, [accActive])

    return null
}

export default PortfolioStreaming
