import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types'
import { useShadow } from '~/component/shadow/SvgShadow'
import Shadow from '~/component/shadow';
import CommonStyle from '~/theme/theme_controller'
import Header from '~/screens/watchlist/Detail/components/HeaderPanner.js'
import ErrorModify from '~s/confirm_order/Components/Error/ErrorModify'
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux'
import { getType } from '~/screens/confirm_order/ConfirmCancelOrder/Model/CancelModel'
import ENUM from '~/enum'
const { CANCEL_TYPE } = ENUM

const HeaderPanelCancel = ({ forwardContext, isHideShadow }) => {
    const [BottomShadow, onLayout] = useShadow()
    const [headerTitle, setHeaderTitle] = useState('')
    useEffect(() => {
        const typeHeader = getType()
        console.log('GET TYPE', typeHeader)
        if (typeHeader === CANCEL_TYPE.CANCEL_ORDER_DEFAULT && typeHeader === CANCEL_TYPE.CANCEL_ORDER_ORIGINAL) {
            setHeaderTitle('Cancel Order')
        }
        if (typeHeader === CANCEL_TYPE.CANCEL_ORDER_ORIGINAL) {
            setHeaderTitle('Cancel Order')
        }
        if (typeHeader === CANCEL_TYPE.CANCEL_ORDER_STOP_LOSS) {
            setHeaderTitle('Cancel Stop Loss Strategy')
        }
        if (typeHeader === CANCEL_TYPE.CANCEL_ORDER_TAKE_PROFIT) {
            setHeaderTitle('Cancel Take Profit Strategy')
        }
    }, [getType])
    const [heightHeader, setHeightHeader] = useState(0)
    const callHeightHeader = useCallback((e) => {
        const { height } = e.nativeEvent.layout
        setHeightHeader(height)
        onLayout(e)
    }, [])
    const getOrderType = getType()
    return (
        <React.Fragment>
            <BottomShadow />
            <View onLayout={callHeightHeader}>
                <Header
                    isHideShadow={isHideShadow}
                    styleBorderRadius={{
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0
                    }}
                    title={headerTitle}
                    onClose={() => {
                        Navigation.dismissModal({
                            animationType: 'none'
                        });
                    }}
                    onRefresh={null}
                    styleContent={{
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0
                    }}
                    styleHeader={{
                        opacity: 0.5,
                        fontFamily: CommonStyle.fontPoppinsRegular
                    }}
                />
            </View>
            <ErrorModify />

        </React.Fragment>
    );
}
function mapStateToProps(state) {
    return {
        isBuy: state.newOrder.isBuy
    }
}
export default connect(mapStateToProps)(HeaderPanelCancel);
