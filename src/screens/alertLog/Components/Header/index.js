import React, { useCallback, useMemo, useRef } from 'react'
import {
    View, Text, Platform, Image, TouchableOpacity
} from 'react-native'
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { cloneDeep, pickBy, map, values } from 'lodash';
import { isIphoneXorAbove } from '~/lib/base/functionUtil'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import SvgIcon from '~s/watchlist/Component/Icon2'
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useShadow } from '~/component/shadow/SvgShadow';
import { Navigation } from 'react-native-navigation';
import * as ContentModel from '~/component/add_symbol/Models/Content.js';
import * as Controller from '~/memory/controller';
import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js';
import { awaitCallback } from '~/screens/watchlist/TradeList/tradelist.hook';
import ENUM from '~/enum';
import { dataStorage } from '~/storage';
import { useInteractableActive } from '~s/alertLog/View/AlertList/RowItem/index.active'
import { getListAlertID, registerInteractable } from '~s/alertLog/Model/AlertLogModel';

const { NAME_PANEL } = ENUM;

export const useDetail = () => {
    const _detail = useRef();
    const dispatch = useDispatch();

    const onShowDetail = useCallback(
        ({ symbol, exchange, priceBoardSelected }) => {
            awaitCallback(
                () => _detail.current,
                () => {
                    _detail.current.changeSymbol(
                        symbol,
                        exchange,
                        handleShowAddSymbol,
                        true,
                        priceBoardSelected
                    );
                    // Call api market-info/symbol to get market_cap / pe_ratio / yearlyend_dividend
                    dispatch.marketInfo.getSymbolInfo({ symbol, exchange });
                }
            );
        },
        [_detail.current]
    );
    return [_detail, onShowDetail];
};
export function getLocalDataSelected({
    listSymbolExchange = { 'BHP#ASX': true }
}) {
    try {
        listSymbolExchange = pickBy(listSymbolExchange, (e) => {
            return e;
        });
        listSymbolExchange = Object.keys(listSymbolExchange).map((el, key) => {
            const [symbol, exchange] = el.split('#');
            return {
                symbol,
                exchange,
                rank: key
            };
        });

        return PriceBoardModel.extractObjectdata({
            value: listSymbolExchange
        });
    } catch (error) {
        return {};
    }
}

const Title = () => {
    return <View style={{ marginLeft: 16 }}>
        <Text style={{
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.font23,
            fontFamily: CommonStyle.fontPoppinsBold
        }}>
            {I18n.t('alert')}
        </Text>
    </View>
}

const Header = ({ navigator }) => {
    const [Shadow, onLayout] = useShadow()
    const [_detail, showDetail] = useDetail();
    const listAlertId = getListAlertID()
    const { refInteractableActive } = useInteractableActive()
    const {
        userPriceBoard,
        staticPriceBoard,
        priceBoardSelected,
        typePriceBoard
    } = useSelector((state) => state.priceBoard, shallowEqual);

    const dispatch = useDispatch();

    const curPriceBoard =
        userPriceBoard[priceBoardSelected] ||
        staticPriceBoard[priceBoardSelected] ||
        {};

    const dicSymbolSelected =
        Object.keys(curPriceBoard).length > 0
            ? PriceBoardModel.getDicSymbolSelected(curPriceBoard)
            : {};

    const openMenu = () => {
        navigator && navigator.toggleDrawer({
            side: 'left',
            animated: true
        });
    }

    const { disabled } = useMemo(() => {
        return {
            disabled: typePriceBoard === ENUM.TYPE_PRICEBOARD.IRESS
        };
    }, [typePriceBoard]);

    const onDone = useCallback((listSymbolExchange) => {
        const value = values(
            getLocalDataSelected({
                listSymbolExchange
            })
        );

        dispatch.priceBoard.updateSpecifyPriceBoard({
            value,
            isRecallApi: false
        });
    }, []);

    const onSelectedSymbol = useCallback(
        ({ symbol, exchange }) => {
            showDetail &&
                showDetail({
                    symbol,
                    exchange,
                    handleShowAddSymbol,
                    priceBoardSelected
                });
            // Call api market-info/symbol to get market_cap / pe_ratio / yearlyend_dividend
            dispatch.marketInfo.getSymbolInfo({ symbol, exchange });
        },
        [dicSymbolSelected, priceBoardSelected]
    );
    const closeInteractable = useCallback(() => {
        refInteractableActive.current && refInteractableActive.current.snapTo && refInteractableActive.current.snapTo({ index: 1 })
    }, [])
    const handleShowAddSymbol = useCallback(
        (isSyncDicSymbolSelected = false) => {
            dispatch.alertLog.readNotification({
                listAlertId: listAlertId,
                onSuccess: () => { },
                onError: () => { }
            });
            registerInteractable({ index: 1, fn: closeInteractable })
            // clearInteractable()
            // Khi show bằng navigation thì nó gán function với dependencies tại thời điểm đấy, nên khi vào sec detail add / remove favorites rồi done thì vẫn chưa update dic symbol mới
            const newDicSymbolSelected = isSyncDicSymbolSelected
                ? ContentModel.getSymbolSelected()
                : dicSymbolSelected;
            Controller.setStatusModalCurrent(true);
            dispatch.subWatchlist.resetActions();
            Navigation.showModal({
                screen: 'equix.SearchSymbolAlerts',
                animated: false,
                animationType: 'none',
                navigatorStyle: {
                    ...CommonStyle.navigatorModalSpecialNoHeader,
                    modalPresentationStyle: 'overCurrentContext'
                },
                overrideBackPress: true,
                passProps: {
                    namePanel: NAME_PANEL.ADD_AND_SEARCH,
                    isSwitchFromQuickButton: true,
                    enabledGestureInteraction: false,
                    onDone: onDone,
                    dicSymbolSelected: { ...newDicSymbolSelected },
                    onSelectedSymbol,
                    disableSelected: disabled,
                    priceBoardSelected,
                    isShowBoxCheck: false
                }
            });
        },
        [dicSymbolSelected, priceBoardSelected]
    );
    const hanleShowSettingNotification = () => {
        dataStorage.changeMenuSelected(ENUM.MENU_SELECTED.settings)
        dataStorage.navigatorGlobal &&
            dataStorage.navigatorGlobal.push({
                screen: 'equix.Setting',
                navigatorStyle: {
                    disabledBackGesture: true,
                    ...CommonStyle.navigatorSpecial
                },
                animated: true,
                animationType: 'fade'
            });
        // navigator && navigator.push({
        //     screen: 'equix.Setting',
        //     navigatorButtons: {
        //     },
        //     appStyle: {
        //         orientation: 'portrait'
        //     },
        //     passProps: {},
        //     navigatorStyle: CommonStyle.navigatorSpecial,
        //     animationType: 'none'
        // });
    }
    return <View style={{ backgroundColor: CommonStyle.color.dark, paddingBottom: 5 }}>
        <View>
            <Shadow />
            <View
                onLayout={onLayout}
                style={{
                    zIndex: 10,
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: isIphoneXorAbove()
                        ? 46
                        : Platform.OS === 'ios'
                            ? 32
                            : 16,
                    paddingBottom: 16
                }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <View style={{
                        alignSelf: 'flex-start',
                        marginLeft: 8,
                        alignItems: 'center',
                        marginTop: 2,
                        marginRight: -8
                    }}>
                        <SvgIcon
                            color={CommonStyle.fontColor}
                            size={36}
                            name={'noun_menu'}
                            onPress={openMenu}
                        />
                    </View>
                    <Title />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacityOpt onPress={handleShowAddSymbol}>
                        <CommonStyle.icons.addAlert
                            color={'#FFFFFF'}
                            size={18}
                            name={'add'}
                            style={{
                                width: 18,
                                height: 18
                            }}
                        />
                    </TouchableOpacityOpt>
                    <TouchableOpacity onPress={hanleShowSettingNotification}>
                        <Image
                            source={require('~/img/icon/settings.png')}
                            style={{ width: 18, height: 18, marginRight: 16, marginLeft: 20 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </View>
}

export default Header
