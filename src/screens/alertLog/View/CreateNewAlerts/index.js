
import React, { useCallback, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, Platform, ScrollView, Easing } from 'react-native';
import Animated from 'react-native-reanimated'
import CommonStyle from '~/theme/theme_controller';

import SymbolInfo from '~s/watchlist/Detail/symbolInfoDetail';
import TradeInfo from '~s/watchlist/Detail/components/TradeInfo.2';
import HeaderPanner from '~/screens/alertLog/View/CreateNewAlerts/HeaderPanner';
import BottomSheetBehavior, { useRefBottomSheet } from '~/component/bottom_sheet_reanimated/index'
import KeyboardNewOrder from '~/screens/new_order/View/Keyboard/Keyboard.js'
import SearchAccountWrapper, { useRefSearchAccount } from '~/component/search_account/SearchAccountWrapper'
import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js'
import HandleDisableTouchabled from '~/component/bottom_sheet_reanimated/HandleDisableTouchabled'
import TouchableDismissKeyboard from '~/component/virtual_keyboard/TouchableDismissKeyboard.js'
import BestBidAsk from '~s/watchlist/Detail/BestBidAsk';

import ButtonClearAlert from '~/screens/alertLog/Components/Button/ButtonCreateAlert';
import ChooseAlerts from './ChooseAlerts';
import { getBodyCreateAlert } from '~s/alertLog/Controller/AlertController'
import { getBodyAlert, setBodyAlert } from '~s/alertLog/Model/AlertLogModel';
import KeyBoadAlert from '~/screens/alertLog/Components/KeyboardAlert'
import NetworkWarning from '~/component/network_warning/network_warning_basic';
import SpacePushContent from '~/component/virtual_keyboard/SpacePushContent.js'
import OrderError from '~/component/Error/OrderError'
import { useDispatch } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import * as Business from '~/business'
import { dataStorage } from '~/storage';
import { getMarginTopDevice } from '~/lib/base/functionUtil';
import Enum from '~/enum'
import ScreenId from '~/constants/screen_id';
import * as InputModel from '~/screens/new_order/Model/InputModel.js'
import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js'
import LayoutContent from '~/screens/new_order/View/Content/Layout/LayoutContent.js'

import { changeSymbolExchange, resetStateNewOrder } from '~/screens/new_order/Redux/actions.js';
const { height: heightDevice } = Dimensions.get('window');
const { Value } = Animated
const marginTopPanel = getMarginTopDevice() + 32
const { INDICES } = Enum.SYMBOL_CLASS
const CreateNewAlerts = ({
    symbol,
    exchange,
    navigator,
    hideDetail,
    onHideAll,
    setSpaceTop,
    isDisableShowNewDetail,
    isBackToSearch = false
}) => {
    const { refBottomSheet, show, hide } = useRefBottomSheet()
    const { refSearchAccount, show: showSearchAccount, hide: hideSearchAccount } = useRefSearchAccount()
    const dispatch = useDispatch()

    useEffect(() => {
		dispatch.quotes.getSnapshot({ listSymbol: [{ symbol, exchange }] });
        dispatch(changeSymbolExchange({ symbol, exchange }))
        dataStorage.currentScreenId = ScreenId.ORDER
        show && show()
        Business.showButtonConfirm()
        return () => {
            AttributeModel.detroy()
            InputModel.reset() // Reset model when unmount new order
            dataStorage.isNeedSubSymbolOnNewOrder = true
            dispatch(resetStateNewOrder())
            onHideAll && onHideAll()
        }
    }, [])
    const classSymbol = useMemo(() => {
        return Business.getClassBySymbolAndExchange({ symbol, exchange })
    }, [symbol, exchange])

    const companyName = useMemo(() => {
        if (!symbol && !exchange) return '';
        return Business.getCompanyName({ symbol, exchange }) || `${symbol}.${exchange}`;
    }, [symbol, exchange]);

    const { _scrollValue } = useMemo(() => {
        return {
            _scrollValue: new Value(0)
        }
    }, [])
    const onCloseDetail = () => {
        dispatch.alertLog.resetBodyAlert()
        Navigation.dismissModal({
            animated: false,
            animationType: 'none'
        })
    };
    const handleHideNewOrder = useCallback(() => {
        Navigation.dismissModal({
            animated: false,
            animationType: 'none'
        })
    }, [])
    const onRefresh = () => {

    }
    const renderHeader = useCallback(() => {
        return (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22,
                    zIndex: 99999
                }}
            >
                <HeaderPanner
                    title={companyName}
                    onClose={onCloseDetail}
                    onRefresh={onRefresh}
                />
                <OrderError isShowConnected={false} />
            </View>
        );
    }, [symbol, exchange])

    const renderContent = useCallback(() => {
        return (
            <TouchableDismissKeyboard>
                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1 }} ref={_scrollValue}>
                        <SpacePushContent>
                            <NetworkWarning />
                            <Text style={{
                                fontSize: CommonStyle.fontSizeM,
                                fontWeight: 'bold',
                                color: CommonStyle.fontColor,
                                marginLeft: 16,
                                marginTop: 8,
                                marginBottom: -8,
                                flex: 1,
                                zIndex: 1000
                            }}>
                                {(symbol + '.' + exchange) || '--'}</Text>
                            <SymbolInfo
                                navigator={navigator}
                                symbol={symbol}
                                exchange={exchange}
                                // showAddToWl={showAddToWl}
                                isShowDetail={false}
                                isShowConnecting={false}
                            />
                            {classSymbol !== INDICES ? <BestBidAsk symbol={symbol} exchange={exchange} /> : null}

                            <TradeInfo symbol={symbol} exchange={exchange} isShowMoreButton={false} />
                            <View style={{ height: 16 }} />
                            <ChooseAlerts symbol={symbol} exchange={exchange} />
                        </SpacePushContent>

                    </ScrollView>
                    <View style={{
                        height: Platform.OS === 'android' ? 68 + 16 : 72 + 16 // height button + padding
                    }} />
                </View>

            </TouchableDismissKeyboard>
        )
    }, [symbol, exchange])
    return (
        <KeyboardAvoidView
            style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>

            <BottomSheetBehavior
                keyExtractor={'NewAlert'}
                ref={refBottomSheet}
                onCloseEnd={handleHideNewOrder}
                onCloseStart={() => console.info('onCloseStart')}
                onOpenStart={() => console.info('onOpenStart')}
                snapPoints={[heightDevice - marginTopPanel, -100]}
                scrollValue={_scrollValue}
                renderContent={renderContent}
                renderHeader={renderHeader}
            />
            <View style={{
                backgroundColor: CommonStyle.backgroundColor,
                zIndex: 999,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0
            }}>
                <ButtonClearAlert
                    symbol={symbol}
                    exchange={exchange}
                    backgroundColor={CommonStyle.color.modify}
                    title={'newAlert'}
                />
            </View>
            <View
                pointerEvents={'box-none'}
                style={{
                    zIndex: 9999,
                    flex: 1
                }}>
                <KeyBoadAlert navigator={navigator} symbol={symbol} exchange={exchange} />
            </View>
            <HandleDisableTouchabled />
        </KeyboardAvoidView>
    )
        ;
}

export default CreateNewAlerts;
