import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import {
    View, Text, FlatList, Dimensions, Keyboard, TouchableWithoutFeedback
} from 'react-native'
import OrdersRow from '~s/orders/View/Content/OrdersRow'
import { useSelector } from 'react-redux'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import LoadingList from '~/component/loading_component/list'
import Animated from 'react-native-reanimated'
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview';
import { clearInteractable } from '~/screens/orders/Model/OrdersModel.js'
const ViewTypes = {
    FULL: 'FULL'
};
const { width: DEVICE_WIDTH } = Dimensions.get('window')
export const HEIGHT_ROW = 72
const dataFake = [
    {
        'account_id': 2000059,
        'account_name': 'Quant Edge',
        'root_parent_order_id': 123123222222222,
        'order_id': 123123222222222,
        'actor_changed': '123ef3',
        'avg_price': 12.22,
        'display_order_id': '1232fd2',
        'symbol': 'BHP.ASX',
        'destination': 'ASX:TM',
        'entry_time': 1234567789,
        'exchange': 'ASX',
        'duration': 'FOK',
        'filled_quantity': 222,
        'filled_quantity_percent': 40,
        'remaining_quantity': 0,
        'side': 'buy',
        'limit_price': 22.33,
        'order_state': 'Partially Filled',
        'order_type': 'MARKET_TO_LIMIT',
        'order_value': 50.02,
        'order_quantity': 10000,
        'order_action': 'Amend',
        'action_status': 'OK',
        'updated': 987654321,
        'is_stoploss': 1,
        'stoploss_order_info': {
            'stoploss_order_id': 8943857389,
            'stoploss_order_status': 'Triggered',
            'stoploss_order_filled_quantity': 220,
            'stoploss_order_quanity': 222,
            'stoploss_order_price': 22.34,
            'stoploss_order_value': 5000.55
        },
        'is_takeprofit': 1,
        'takeprofit_order_info': {
            'takeprofit_order_id': 8943857389,
            'takeprofit_order_status': 'Inactive',
            'takeprofit_order_filled_quantity': 220,
            'takeprofit_order_quantity': 222,
            'takeprofit_order_price': 30.34,
            'takeprofit_order_value': 5000.55
        },
        'fill_status': 'Filled'
    },
    {
        'account_id': 2000059,
        'account_name': 'Quant Edge',
        'root_parent_order_id': 123123222222222,
        'order_id': 123123222222222,
        'actor_changed': '123ef3',
        'avg_price': 12.22,
        'display_order_id': '1232fd2',
        'symbol': 'ANZ.ASX',
        'destination': 'ASX:TM',
        'entry_time': 1234567789,
        'exchange': 'ASX',
        'duration': 'FOK',
        'filled_quantity': 222,
        'filled_quantity_percent': 0,
        'remaining_quantity': 0,
        'side': 'sell',
        'limit_price': 22.33,
        'order_state': 'Filled',
        'order_type': 'MARKET_TO_LIMIT',
        'order_value': 50.02,
        'order_quantity': 10000,
        'order_action': 'Amend',
        'action_status': 'OK',
        'updated': 987654321,
        'is_stoploss': 0,
        'stoploss_order_info': {
            'stoploss_order_id': 8943857389,
            'stoploss_order_status': 'Triggered',
            'stoploss_order_filled_quantity': 220,
            'stoploss_order_quanity': 222,
            'stoploss_order_price': 22.34,
            'stoploss_order_value': 5000.55
        },
        'is_takeprofit': 1,
        'takeprofit_order_info': {
            'takeprofit_order_id': 8943857389,
            'takeprofit_order_status': 'Inactive',
            'takeprofit_order_filled_quantity': 220,
            'takeprofit_order_quantity': 222,
            'takeprofit_order_price': 30.34,
            'takeprofit_order_value': 5000.55
        },
        'fill_status': 'Filled'
    },
    {
        'account_id': 2000059,
        'account_name': 'Quant Edge',
        'root_parent_order_id': 123123222222222,
        'order_id': 123123222222222,
        'actor_changed': '123ef3',
        'avg_price': 12.22,
        'display_order_id': '1232fd2',
        'symbol': 'THC.ASX',
        'destination': 'ASX:TM',
        'entry_time': 1234567789,
        'exchange': 'ASX',
        'duration': 'FOK',
        'filled_quantity': 222,
        'filled_quantity_percent': 100,
        'remaining_quantity': 0,
        'side': 'sell',
        'limit_price': 22.33,
        'order_state': 'Partially Filled',
        'order_type': 'MARKET_TO_LIMIT',
        'order_value': 50.02,
        'order_quantity': 10000,
        'order_action': 'Amend',
        'action_status': 'OK',
        'updated': 987654321,
        'is_stoploss': 0,
        'stoploss_order_info': {
            'stoploss_order_id': 8943857389,
            'stoploss_order_status': 'Triggered',
            'stoploss_order_filled_quantity': 220,
            'stoploss_order_quanity': 222,
            'stoploss_order_price': 22.34,
            'stoploss_order_value': 5000.55
        },
        'is_takeprofit': 0,
        'takeprofit_order_info': {
            'takeprofit_order_id': 8943857389,
            'takeprofit_order_status': 'Inactive',
            'takeprofit_order_filled_quantity': 220,
            'takeprofit_order_quantity': 222,
            'takeprofit_order_price': 30.34,
            'takeprofit_order_value': 5000.55
        },
        'fill_status': 'Filled'
    },
    {
        'account_id': 2000059,
        'account_name': 'Quant Edge',
        'root_parent_order_id': 123123222222222,
        'order_id': 123123222222222,
        'actor_changed': '123ef3',
        'avg_price': 12.22,
        'display_order_id': '1232fd2',
        'symbol': 'MQG.ASX',
        'destination': 'ASX:TM',
        'entry_time': 1234567789,
        'exchange': 'ASX',
        'duration': 'FOK',
        'filled_quantity': 222,
        'filled_quantity_percent': 70,
        'remaining_quantity': 0,
        'side': 'buy',
        'limit_price': 22.33,
        'order_state': 'Filled',
        'order_type': 'MARKET_TO_LIMIT',
        'order_value': 50.02,
        'order_quantity': 10000,
        'order_action': 'Amend',
        'action_status': 'OK',
        'updated': 987654321,
        'is_stoploss': 1,
        'stoploss_order_info': {
            'stoploss_order_id': 8943857389,
            'stoploss_order_status': 'Triggered',
            'stoploss_order_filled_quantity': 220,
            'stoploss_order_quanity': 222,
            'stoploss_order_price': 22.34,
            'stoploss_order_value': 5000.55
        },
        'is_takeprofit': 1,
        'takeprofit_order_info': {
            'takeprofit_order_id': 8943857389,
            'takeprofit_order_status': 'Inactive',
            'takeprofit_order_filled_quantity': 220,
            'takeprofit_order_quantity': 222,
            'takeprofit_order_price': 30.34,
            'takeprofit_order_value': 5000.55
        },
        'fill_status': 'Partially Filled'
    },
    {
        'account_id': 2000059,
        'account_name': 'Quant Edge',
        'root_parent_order_id': 123123222222222,
        'order_id': 123123222222222,
        'actor_changed': '123ef3',
        'avg_price': 12.22,
        'display_order_id': '1232fd2',
        'symbol': 'NAB.ASX',
        'destination': 'ASX:TM',
        'entry_time': 1234567789,
        'exchange': 'ASX',
        'duration': 'FOK',
        'filled_quantity': 222,
        'filled_quantity_percent': 65,
        'remaining_quantity': 0,
        'side': 'buy',
        'limit_price': 22.33,
        'order_state': 'Partially Filled',
        'order_type': 'MARKET_TO_LIMIT',
        'order_value': 50.02,
        'order_quantity': 10000,
        'order_action': 'Amend',
        'action_status': 'OK',
        'updated': 987654321,
        'is_stoploss': 1,
        'stoploss_order_info': {
            'stoploss_order_id': 8943857389,
            'stoploss_order_status': 'Triggered',
            'stoploss_order_filled_quantity': 220,
            'stoploss_order_quanity': 222,
            'stoploss_order_price': 22.34,
            'stoploss_order_value': 5000.55
        },
        'is_takeprofit': 1,
        'takeprofit_order_info': {
            'takeprofit_order_id': 8943857389,
            'takeprofit_order_status': 'Inactive',
            'takeprofit_order_filled_quantity': 220,
            'takeprofit_order_quantity': 222,
            'takeprofit_order_price': 30.34,
            'takeprofit_order_value': 5000.55
        },
        'fill_status': 'Partially Filled'
    }
]

const HeaderList = () => {
    return <View>

    </View>
}

const FooterList = () => {
    return <View style={{
        height: 88 + 8
    }} />
}

const RowLoadingComp = ({ item, index, animStyles }) => {
    return <Animated.View style={[{
        height: HEIGHT_ROW,
        backgroundColor: CommonStyle.color.dark,
        marginHorizontal: 8,
        marginTop: 8,
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row'
    }, animStyles]}>
        <View style={{
            width: '40%',
            marginRight: 16,
            borderRadius: 8,
            backgroundColor: '#ffffff30'
        }} />
        <View style={{
            width: '60%'
        }}>
            <View style={{
                backgroundColor: '#ffffff30',
                borderRadius: 8,
                alignSelf: 'baseline',
                overflow: 'hidden',
                height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 3
            }}>
                <Text style={{
                    opacity: 0
                }}>
                    {`BHP.ASX EQT`}
                </Text>
            </View>
            <View style={{
                backgroundColor: '#ffffff30',
                marginTop: 4,
                borderRadius: 8,
                alignSelf: 'baseline',
                overflow: 'hidden',
                height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 3
            }}>
                <Text style={{
                    opacity: 0
                }}>
                    {`Volume: 1000000000`}
                </Text>
            </View>
            <View style={{
                backgroundColor: '#ffffff30',
                marginTop: 4,
                borderRadius: 8,
                alignSelf: 'baseline',
                overflow: 'hidden',
                height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 3
            }}>
                <Text style={{
                    opacity: 0
                }}>
                    {`Price: 123.0000000000`}
                </Text>
            </View>
        </View>
    </Animated.View>
}

export const HandleLoading = React.memo(({ refLoading, resetList }) => {
    const isLoading = useSelector(state => state.orders.isLoading)
    useEffect(() => {
        if (isLoading) {
            refLoading.current && refLoading.current.start && refLoading.current.start()
            resetList && resetList()
        } else {
            refLoading.current && refLoading.current.stop && refLoading.current.stop()
        }
    }, [isLoading])
    return null
}, () => true)

const OrdersList = ({ navigator, showHideTabbar, showDetail, blurSearch, updateActiveStatus }) => {
    const data = useSelector(state => state.orders.data)
    const _recyclerListView = useRef()
    const dataProvider = new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(
        data
    )
    const refLoading = useRef({})
    const keyExtractor = useCallback((item, index) => {
        return item.order_id
    }, [])
    const translateYAnim = useMemo(() => {
        return new Animated.Value(0)
    }, [])
    const renderHeader = useCallback(() => {
        return <HeaderList />
    }, [])
    const renderFooter = useCallback(() => {
        return <FooterList />
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
                {renderFooter()}
            </View>
        </TouchableWithoutFeedback>
    }, [])
    const renderItem = useCallback(({ item, index }) => {
        return <OrdersRow
            navigator={navigator}
            updateActiveStatus={updateActiveStatus}
            blurSearch={blurSearch}
            item={item}
            index={index}
            showHideTabbar={showHideTabbar}
            showDetail={showDetail} />
    }, [])
    const onScrollBeginDrag = () => {
        blurSearch && blurSearch()
        clearInteractable && clearInteractable()
    }
    const layoutProvider = new LayoutProvider(
        index => {
            return ViewTypes.FULL;
        },
        (type, dim) => {
            switch (type) {
                case ViewTypes.FULL:
                    dim.width = DEVICE_WIDTH;
                    dim.height = HEIGHT_ROW + 8;
                    break;
                default:
                    dim.width = DEVICE_WIDTH;
                    dim.height = HEIGHT_ROW + 8;
                    break;
            }
        }
    );
    const _rowRenderer = (type, data, index) => {
        return renderItem({ item: data, index })
    }
    return <View onStartShouldSetResponder={Keyboard.dismiss} style={{ flex: 1 }}>
        <HandleLoading
            resetList={() => {
                try {
                    _recyclerListView.current._scrollViewRef.scrollTo({
                        x: 0,
                        y: 0,
                        animated: true
                    });
                    clearInteractable()
                } catch (error) {

                }
            }}
            refLoading={refLoading} />
        {
            // <FlatList
            //     contentContainerStyle={!data.length && { flexGrow: 1 }}
            //     keyboardShouldPersistTaps={'always'}
            //     showsVerticalScrollIndicator={false}
            //     data={data}
            //     keyExtractor={keyExtractor}
            //     onScrollBeginDrag={onScrollBeginDrag}
            //     ListHeaderComponent={renderHeader}
            //     ListFooterComponent={renderFooter}
            //     ListEmptyComponent={renderNodata}
            //     renderItem={renderItem}
            // />
            data.length
                ? <RecyclerListView
                    scrollViewProps={{
                        showsVerticalScrollIndicator: false,
                        onScrollBeginDrag,
                        ref: _recyclerListView
                    }}
                    keyboardShouldPersistTaps="always"
                    layoutProvider={layoutProvider}
                    dataProvider={dataProvider}
                    renderFooter={renderFooter}
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
}

export default OrdersList
