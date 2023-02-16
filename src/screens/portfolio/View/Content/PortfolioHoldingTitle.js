import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import {
    View, Text, StyleSheet, TouchableOpacity
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { useDispatch } from 'react-redux'
import { changePLState } from '../../Redux/actions'
import { useShadow } from '~/component/shadow/SvgShadowCustom'
import { getAccActive } from '~s/portfolio/Model/PortfolioAccountModel'

const TodayPl = ({ activeTab, onChangeTab }) => {
    const onPress = () => {
        onChangeTab && onChangeTab(0)
    }
    const activeStyle = useMemo(() => {
        if (activeTab === 0) {
            return {
                borderBottomColor: CommonStyle.color.modify,
                borderRightColor: CommonStyle.color.modify
            }
        }
        return {
            borderBottomColor: CommonStyle.color.dark,
            borderRightColor: CommonStyle.color.dark
        }
    }, [activeTab])
    const activeWrapperStyle = useMemo(() => {
        if (activeTab === 0) {
            return {
                borderBottomColor: CommonStyle.color.modify,
                borderRightColor: CommonStyle.color.modify
            }
        }
        return {
            borderBottomColor: CommonStyle.color.dusk,
            borderRightColor: CommonStyle.color.dusk
        }
    }, [activeTab])
    const activeTextStyle = useMemo(() => {
        if (activeTab === 0) {
            return {
                opacity: 1,
                color: CommonStyle.fontBlack
            }
        }
        return {
            opacity: 0.7,
            color: CommonStyle.fontColor
        }
    }, [activeTab])
    return <TouchableOpacity
        onPress={onPress}
        style={[{ height: 24, width: 90, justifyContent: 'center', alignItems: 'center' }]}>
        <View
            style={[styles.trapeZoidLeft, styles.wrapperStyle, activeStyle]} />
        <View style={[{ position: 'absolute' }, styles.wrapperTrapeZoidLeft, activeWrapperStyle]} />
        <Text style={[{
            fontSize: CommonStyle.font13,
            fontFamily: CommonStyle.fontPoppinsRegular,
            zIndex: 999,
            position: 'absolute'
        }, activeTextStyle]}>
            {I18n.t('totalPL')}
        </Text>
    </TouchableOpacity>
}

const DayPl = ({ activeTab, onChangeTab }) => {
    const onPress = () => {
        onChangeTab && onChangeTab(1)
    }
    const activeStyle = useMemo(() => {
        if (activeTab === 1) {
            return {
                borderBottomColor: CommonStyle.color.modify,
                borderRightColor: CommonStyle.color.modify
            }
        }
        return {
            borderBottomColor: CommonStyle.color.dark,
            borderRightColor: CommonStyle.color.dark
        }
    }, [activeTab])
    const activeWrapperStyle = useMemo(() => {
        if (activeTab === 1) {
            return {
                borderBottomColor: CommonStyle.color.modify,
                borderRightColor: CommonStyle.color.modify
            }
        }
        return {
            borderBottomColor: CommonStyle.color.dusk,
            borderRightColor: CommonStyle.color.dusk
        }
    }, [activeTab])
    const activeTextStyle = useMemo(() => {
        if (activeTab === 1) {
            return {
                opacity: 1,
                color: CommonStyle.fontBlack
            }
        }
        return {
            opacity: 0.7,
            color: CommonStyle.fontColor
        }
    }, [activeTab])
    return <TouchableOpacity
        onPress={onPress}
        style={[{ height: 24, width: 90, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={[styles.trapeZoidRight, styles.wrapperStyle, activeStyle]} />
        <View style={[{ position: 'absolute' }, styles.wrapperTrapeZoidRight, activeWrapperStyle]} />
        <Text style={[{
            fontSize: CommonStyle.font13,
            fontFamily: CommonStyle.fontPoppinsRegular,
            zIndex: 999,
            position: 'absolute'
        }, activeTextStyle]}>
            {I18n.t('dayPL')}
        </Text>
    </TouchableOpacity>
}

const PortfolioHoldingTitle = ({ numberHolding = 0 }) => {
    const [Shadow, onLayout] = useShadow()
    const dic = useRef({ init: true })
    const title = useMemo(() => {
        return `${I18n.t('portfolioHolding')} (${numberHolding})`
    }, [numberHolding])
    const [activeTab, setActiveTab] = useState(() => {
        return 0
    })
    const activeAccountId = getAccActive()
    const dispatch = useDispatch()
    const onChangeTab = useCallback((newActiveTab) => {
        if (activeTab === newActiveTab) return
        // 0 - todayPL 1 - dayPL
        dispatch(changePLState(newActiveTab))
        setActiveTab(newActiveTab)
    }, [activeTab])
    useEffect(() => {
        if (dic.current.init) {
            dic.current.init = false
        } else {
            setActiveTab(0)
        }
    }, [activeAccountId])
    return <View style={{ paddingBottom: 4 }}>
        <View>
            <Shadow />
        </View>
        <View
            onLayout={onLayout}
            style={{
                zIndex: 10,
                width: '100%',
                padding: 10,
                backgroundColor: CommonStyle.color.dark,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                opacity: 0.5,
                fontSize: CommonStyle.font13,
                color: CommonStyle.fontColor
            }}>
                {title}
            </Text>
            <View style={{ flexDirection: 'row' }}>
                <TodayPl activeTab={activeTab} onChangeTab={onChangeTab} />
                <DayPl activeTab={activeTab} onChangeTab={onChangeTab} />
            </View>
        </View>
    </View>
}

styles = StyleSheet.create({
    wrapperStyle: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    trapeZoidLeft: {
        zIndex: 99,
        width: 87,
        height: 0,
        borderBottomWidth: 20,
        borderBottomColor: 'red',
        borderLeftWidth: 10,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'red',
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        transform: [{ rotate: '180deg' }]
    },
    wrapperTrapeZoidLeft: {
        width: 90,
        height: 0,
        borderBottomWidth: 22,
        borderBottomColor: 'blue',
        borderLeftWidth: 11,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'blue',
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        transform: [{ rotate: '180deg' }, { translateX: -0.5 }]
    },
    trapeZoidRight: {
        zIndex: 99,
        width: 87,
        height: 0,
        borderBottomWidth: 20,
        borderBottomColor: 'red',
        borderLeftWidth: 10,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'red',
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        left: -6
    },
    wrapperTrapeZoidRight: {
        width: 90,
        height: 0,
        borderBottomWidth: 22,
        borderBottomColor: 'blue',
        borderLeftWidth: 11,
        borderLeftColor: 'transparent',
        borderRightWidth: 50,
        borderRightColor: 'blue',
        borderStyle: 'solid',
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        left: -6
    }
})

export default PortfolioHoldingTitle
