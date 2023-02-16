import React, { useImperativeHandle, useCallback, useMemo } from 'react'
import { View, Text, Platform } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import I18n from '~/modules/language/'
import Animated, { Easing } from 'react-native-reanimated'
import { useSelector, useDispatch } from 'react-redux'
import { useShadow } from '~/component/shadow/SvgShadowCustom'
import { Navigation } from 'react-native-navigation';
import { changeBuySell, changeBuySellAndPositionAffected } from '~/screens/new_order/Redux/actions.js'
import ScreenId from '~/constants/screen_id';
import { func, dataStorage } from '~/storage';
import { exOnDataFunction, setData } from '~/screens/portfolio/Model/StreamingModel.js'
import Enum from '~/enum'
const { NAME_PANEL } = Enum
const {
    Value,
    timing
} = Animated
export function handldeCaculateAndSizeByPosition({
    isBuy,
    volume
}) {
    if (isBuy) {
        return {
            volume: null,
            isBuy: true
        }
    } else {
        if (volume < 0) {
            return {
                volume: Math.abs(volume),
                isBuy: true
            }
        }
        return {
            volume: volume,
            isBuy: false
        }
    }
}

const PortfolioButtonBuySell = React.forwardRef((props, ref) => {
    const [Shadow, onLayout] = useShadow()
    const isConnectedRedux = useSelector(state => state.app.isConnected)
    const dispatch = useDispatch()
    const disabled = useMemo(() => {
        return !isConnectedRedux
    }, [isConnectedRedux])
    useImperativeHandle(ref, () => {
        return {
            show,
            hide
        }
    })
    const translateYAnim = useMemo(() => {
        return new Value(300)
    }, [])
    const show = useCallback((isQuick) => {
        if (isQuick) return translateYAnim.setValue(0)
        timing(translateYAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear
        }).start()
    }, [])
    const hide = useCallback((isQuick) => {
        if (isQuick) return translateYAnim.setValue(300)
        timing(translateYAnim, {
            toValue: 300,
            duration: 300,
            easing: Easing.linear
        }).start()
    }, [])
    const openBuyOrder = useCallback(() => {
        const { symbol, exchange, currentPosition } = props.getSymbolExchange()
        const { isBuy, volume } = handldeCaculateAndSizeByPosition({ isBuy: true, volume: currentPosition.volume })
        dispatch(changeBuySellAndPositionAffected({ isBuy: isBuy, position: currentPosition, volume }))
        Platform.OS === 'android' && props.updateActiveStatus && props.updateActiveStatus(false)
        Navigation.showModal({
            screen: 'equix.NewOrder',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorModalSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                hideDetail: props.hideDetail,
                setSpaceTop: props.setSpaceTop,
                namePanel: NAME_PANEL.NEW_ORDER,
                isSwitchFromQuickButton: false,
                symbol,
                exchange,
                onHideAll: () => {
                    dataStorage.currentScreenId = ScreenId.PORTFOLIO
                    exOnDataFunction() // Cap nhat portfolio data streaming
                    setData(null)
                }
            }
        })
    }, [])
    const openSellOrder = useCallback(() => {
        const { symbol, exchange, currentPosition } = props.getSymbolExchange()
        const { isBuy, volume } = handldeCaculateAndSizeByPosition({ isBuy: false, volume: currentPosition.volume })
        dispatch(changeBuySellAndPositionAffected({ isBuy: isBuy, position: currentPosition, volume }))
        Platform.OS === 'android' && props.updateActiveStatus && props.updateActiveStatus(false)
        Navigation.showModal({
            screen: 'equix.NewOrder',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorModalSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                hideDetail: props.hideDetail,
                setSpaceTop: props.setSpaceTop,
                namePanel: NAME_PANEL.NEW_ORDER,
                isSwitchFromQuickButton: true,
                symbol,
                exchange,
                onHideAll: () => {
                    dataStorage.currentScreenId = ScreenId.PORTFOLIO
                    exOnDataFunction() // Cap nhat portfolio data streaming
                }
            }
        })
    }, [])
    return <Animated.View style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 101,
        transform: [{
            translateY: translateYAnim
        }]
    }}>
        <View style={{}}>
            <Shadow />
            <View
                onLayout={onLayout}
                style={{
                    zIndex: 10,
                    backgroundColor: CommonStyle.color.dark,
                    width: '100%',
                    paddingHorizontal: 8,
                    paddingTop: 8,
                    paddingBottom: 24,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                <TouchableOpacityOpt
                    onPress={openBuyOrder}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        backgroundColor: disabled
                            ? CommonStyle.btnDisableBg
                            : CommonStyle.color.backBuy,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: CommonStyle.color.dusk_tabbar,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 4
                    }}>
                    <Text style={{
                        fontSize: CommonStyle.font17,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color: CommonStyle.color.textBuy
                    }}>
                        {I18n.t('buyUpper')}
                    </Text>
                </TouchableOpacityOpt>
                <View style={{ width: 16 }} />
                <TouchableOpacityOpt
                    onPress={openSellOrder}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        backgroundColor: disabled
                            ? CommonStyle.btnDisableBg
                            : CommonStyle.color.backSell,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: CommonStyle.color.dusk_tabbar,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 4
                    }}>
                    <Text style={{
                        fontSize: CommonStyle.font17,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color: CommonStyle.color.textSell
                    }}>
                        {I18n.t('sellUpper')}
                    </Text>
                </TouchableOpacityOpt>
            </View>
        </View>
    </Animated.View>
})

export default PortfolioButtonBuySell
