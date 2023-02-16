import React, { useEffect, useLayoutEffect } from 'react';
import { Text, View, StyleSheet, SafeAreaView, ScrollView, Dimensions, Platform } from 'react-native';
import PropTypes from 'prop-types'
import HeaderPanel from './Views/HeaderPanel'
import Content from './Views/Content/Content'
import ButtonPlaceOrder from './Components/RowOrderInfo/ButtonPlaceOrder'
import CommonStyle from '~/theme/theme_controller'
import { resetStateConfirmOrder } from './Redux/actions'
import {
    isIphoneXorAbove
} from '~/lib/base/functionUtil'
import { HandleGetInitialMarginComp } from '~/screens/confirm_order/HandleGetInitialMargin.js'
import Error from '~/component/error_system/Error.js'
import * as Business from '~/business'
import * as Controller from '~/memory/controller';
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import ScreenId from '~/constants/screen_id'
import { dataStorage, func } from '~/storage';
import { dismissModalPlaceOrder } from '~/screens/confirm_order/Redux/actions.js'
import { Navigation } from 'react-native-navigation';

const { height: heightDevice } = Dimensions.get('window')
const ConfirmOrder = (props) => {
    useLayoutEffect(() => {
        dataStorage.currentScreenId = ScreenId.CONFIRM_PLACE_ORDER
        return () => dataStorage.currentScreenId = ScreenId.ORDER
    }, [])
    return (
        <View style={{
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1
        }}>
            <HandleGetInitialMarginComp />
            <View style={{
                marginHorizontal: 16,
                backgroundColor: CommonStyle.backgroundColor,
                overflow: 'hidden',
                alignSelf: 'center',
                maxHeight: isIphoneXorAbove() ? heightDevice - 48 - 32 : Platform.OS === 'ios' ? heightDevice - 64 : heightDevice - 32
            }}>
                <HeaderPanel isHideShadow />
                <Error screenId={ScreenId.CONFIRM_PLACE_ORDER} onReTry={() => {
                    dataStorage.getFees && dataStorage.getFees()
                    dataStorage.getPortfolioBalance && dataStorage.getPortfolioBalance()
                }} />
                <ScrollView style={{
                    flexGrow: 0
                }}>
                    <Content {...props} />
                </ScrollView>
                < ButtonPlaceOrder {...props} />
            </View >
        </View>
    )
        ;
}
ConfirmOrder.propTypes = {};

export default ConfirmOrder;
