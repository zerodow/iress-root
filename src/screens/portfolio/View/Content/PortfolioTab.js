import React, { useRef, useMemo, useImperativeHandle, useEffect } from 'react'
import {
    View, Text, Dimensions
} from 'react-native'
import TabChangeButton from './TabChangeButton'
import TabTitle from './TabTitle'
import TabContent from './TabContent'
import I18n from '~/modules/language/'
import Animated, { Easing } from 'react-native-reanimated'
import CommonStyle from '~/theme/theme_controller'
import { useSelector } from 'react-redux'
const {
    Value,
    timing
} = Animated
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
const TOTAL_HEIGHT = 42 + 36 + 251 + 5 + 5
let PortfolioTab = (props, ref) => {
    const refScroll = useRef({})
    const refTitle = useRef({})
    const refButton = useRef({})
    const refContent = useRef({})
    const dic = useRef({
        isShow: false
    })
    const heightAnim = useMemo(() => {
        return new Value(0)
    }, [])
    const opacityAnim = useMemo(() => {
        return new Value(1)
    }, [])
    const handleHeight = () => {
        return new Promise(resolve => {
            refContent.current && refContent.current.measure && refContent.current.measure((x, y, w, h, pX, pY) => {
                resolve({ x, y, w, h, pX, pY })
            })
        })
    }
    const show = async () => {
        const { x, y, w, h, pX, pY } = await handleHeight()
        dic.current.isShow = true
        timing(heightAnim, {
            toValue: h,
            duration: 200,
            easing: Easing.linear
        }).start()
        timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.linear
        }).start()
    }
    const hide = () => {
        dic.current.isShow = false
        timing(heightAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.linear
        }).start()
        timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.linear
        }).start()
    }
    useImperativeHandle(ref, () => {
        return {
            show,
            hide
        }
    })
    const setTitle = (tabActive) => {
        const title = tabActive
            ? I18n.t('portfolioDistribution')
            : I18n.t('portfolioSummary')
        refTitle.current && refTitle.current.setTitle && refTitle.current.setTitle(title)
    }
    const scrollToBegin = () => {
        refScroll.current && refScroll.current.scrollTo({ x: 0, animated: true })
        setTitle(0)
    }
    const scrollToEnd = () => {
        refScroll.current && refScroll.current.scrollTo({ x: 2 * DEVICE_WIDTH, animated: true })
        setTitle(1)
    }
    return <Animated.View style={{ width: '100%', opacity: opacityAnim, height: heightAnim, overflow: 'hidden', backgroundColor: CommonStyle.color.dark }}>
        <HandleWhenChangeAccount show={show} hide={hide} dic={dic} />
        <View collapsable={false} ref={refContent} style={{ position: 'absolute', opacity: 1 }}>
            <TabChangeButton
                ref={refButton}
                scrollToEnd={scrollToEnd}
                scrollToBegin={scrollToBegin} />
            <TabTitle ref={refTitle} />
            <TabContent
                refButton={refButton}
                refScroll={refScroll}
                setTitle={setTitle} />
        </View>
    </Animated.View>
}
const HandleWhenChangeAccount = ({ show, hide, dic: dicParent }) => {
    const accActive = useSelector(state => state.portfolio.accActive)
    const dic = useRef({ init: true })
    useEffect(() => {
        if (dic.current.init) {
            dic.current.init = false
        } else {
            dicParent.current.isShow && show()
            !dicParent.current.isShow && hide()
        }
    }, [accActive])
    return null
}
PortfolioTab = React.forwardRef(PortfolioTab)
PortfolioTab = React.memo(PortfolioTab, () => true)
export default PortfolioTab
