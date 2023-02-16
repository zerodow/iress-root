import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { View, Text, FlatList, Dimensions, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import Animated from 'react-native-reanimated'
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import { HandleLoading } from '~/screens/marketActivity/HandleLoading.js'
import Item, { HEIGHT_ROW } from '~/screens/marketActivity/Components/Item.js'
import LoadingList, { RowLoadingComp } from '~/screens/marketActivity/Components/LoadingList.js'
import { clearInteractable } from '~/screens/marketActivity/Models/MarketActivityModel.js'
import { useUpdateChangeTheme } from '~/component/hook';
const ViewTypes = {
    FULL: 'FULL'
};
const { width: DEVICE_WIDTH } = Dimensions.get('window')
export const HEIGHT_SEPERATOR = 8
export default React.memo(({
    showAddToWl,
    onRowPress,
    showNewOrder,
    onNewAlertLog
}) => {
    const refLoading = useRef({})
    const { typeWatchlist, arrMarketData } = useSelector(state => {
        return {
            typeWatchlist: state.marketActivity.typeWatchlist,
            arrMarketData: state.marketActivity.marketWatchlist
        }
    }, shallowEqual)
    const translateYAnim = useMemo(() => {
        return new Animated.Value(0)
    }, [])
    const renderNodata = useCallback(() => {
        // if (isLoading) return null
        return <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={{
                    color: CommonStyle.fontColor,
                    fontFamily: CommonStyle.fontPoppinsRegular
                }}>
                    {I18n.t('noData')}
                </Text>
            </View>
        </TouchableWithoutFeedback>
    }, [])

    const _rowRenderer = (type, data, index) => {
        return (
            <Item
                showNewOrder={showNewOrder}
                onRowPress={onRowPress}
                showAddToWl={showAddToWl}
                onNewAlertLog={onNewAlertLog}
                typeWatchlist={typeWatchlist}
                index={index}
                item={data} />
        )
    }

    const layoutProvider = useMemo(() => (
        new LayoutProvider(
            index => {
                return ViewTypes.FULL;
            },
            (type, dim) => {
                switch (type) {
                    case ViewTypes.FULL:
                        dim.width = DEVICE_WIDTH;
                        dim.height = HEIGHT_ROW + HEIGHT_SEPERATOR;
                        break;
                    default:
                        dim.width = DEVICE_WIDTH;
                        dim.height = HEIGHT_ROW + HEIGHT_SEPERATOR;
                        break;
                }
            }
        )
    ), [])
    const dataProvider = useMemo(() => (
        new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(
            arrMarketData
        )
    ), [arrMarketData])
    const _recyclerListView = useRef()
    useUpdateChangeTheme()
    return (
        <View onStartShouldSetResponder={Keyboard.dismiss} style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor1 }}>
            <HandleLoading resetList={() => {
                try {
                    _recyclerListView.current._scrollViewRef.scrollTo({
                        x: 0,
                        y: 0,
                        animated: true
                    });
                } catch (error) {

                }
            }} refLoading={refLoading} />
            {
                arrMarketData.length
                    ? <RecyclerListView
                        scrollViewProps={{
                            showsVerticalScrollIndicator: false,
                            onScrollBeginDrag: () => {
                                clearInteractable && clearInteractable()
                            }
                        }}
                        onMomentumScrollBegin={() => {
                            clearInteractable && clearInteractable()
                        }}
                        scrollViewProps={{
                            showsVerticalScrollIndicator: false,
                            ref: _recyclerListView,
                            contentContainerStyle: {
                                paddingTop: 8
                            }
                        }}
                        renderFooter={() => <View style={{ height: 88 }} />}
                        keyboardShouldPersistTaps="always"
                        layoutProvider={layoutProvider}
                        dataProvider={dataProvider}
                        rowRenderer={_rowRenderer} />
                    : renderNodata()
            }
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    backgroundColor: CommonStyle.backgroundColor1,
                    transform: [{
                        translateY: translateYAnim
                    }]
                }}>
                <LoadingList
                    ref={refLoading}
                    rowLoadingComp={RowLoadingComp}
                    translateY={translateYAnim}
                    duration={1000}
                    scrollEnabled={true} />
            </Animated.View>
        </View>
    )
}, () => true)
