import React, {
    useMemo, useCallback, useRef, useState, useImperativeHandle, forwardRef,
    useEffect
} from 'react'
import { StyleSheet, View, Keyboard, Text } from 'react-native'
import { cloneDeep, pickBy, map, values } from 'lodash';
import I18n from '~/modules/language/'
import CommonStyle from '~/theme/theme_controller'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import SvgIcon from '~s/watchlist/Component/Icon2';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import * as ContentModel from '~/component/add_symbol/Models/Content.js';
import * as Controller from '~/memory/controller';
import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js';
import { awaitCallback } from '~/screens/watchlist/TradeList/tradelist.hook';
import { isIphoneXorAbove } from '~/lib/base/functionUtil'
import ENUM from '~/enum';
import { Navigation } from 'react-native-navigation';
import * as Business from '~/business'

const FOOTER_HEIGHT = 16
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
const ShowCreateAlert = ({ navigator }) => {
    const [_detail, showDetail] = useDetail();
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
    const handleShowAddSymbol = useCallback(
        (isSyncDicSymbolSelected = false) => {
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
    return (
        <View style={{ width: '100%', alignItems: 'center', flex: 1 }}>
            <TouchableOpacityOpt
                onPress={handleShowAddSymbol}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 31,
                    paddingHorizontal: 16,
                    marginBottom: 16,
                    borderRadius: 8,
                    backgroundColor: CommonStyle.color.dark,
                    marginTop: 16
                }}
            >
                <SvgIcon
                    color={CommonStyle.color.modify}
                    size={13}
                    name={'add'}
                    style={{
                        marginRight: 8,
                        opacity: 0.75
                    }}
                />
                <Text
                    style={{
                        color: CommonStyle.color.modify,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font11,
                        opacity: 0.75,
                        paddingTop: 2
                    }}
                >
                    {I18n.t('createAlert')}
                </Text>
            </TouchableOpacityOpt>
        </View>
    )
}

export default ShowCreateAlert

const styles = StyleSheet.create({})
