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
import { getType } from '~/screens/new_order/Model/OrderEntryModel'
import ENUM from '~/enum'
const { AMEND_TYPE } = ENUM

const HeaderPanel = ({ forwardContext, isHideShadow }) => {
    const [BottomShadow, onLayout] = useShadow()
    const [headerTitle, setHeaderTitle] = useState('')
    const [heightHeader, setHeightHeader] = useState(0)
    useEffect(() => {
        const typeHeader = getType()

        if (typeHeader === AMEND_TYPE.AMEND_ORIGINAL) {
            setHeaderTitle('Amend Your Order')
        }
        if (typeHeader === AMEND_TYPE.AMEND_TRADING_PROFITLOSS) {
            setHeaderTitle('Amend Take Profit Strategy')
        }
        if (typeHeader === AMEND_TYPE.AMEND_TRADING_STRATEGIES) {
            setHeaderTitle('Amend Your Order')
        }
        if (typeHeader === AMEND_TYPE.AMEND_TRADING_STOPPRICE) {
            setHeaderTitle('Amend Your Stop Loss Strategy')
        }
    }, [getType])
    const callHeightHeader = useCallback((e) => {
        const { height } = e.nativeEvent.layout
        setHeightHeader(height)
        onLayout(e)
    }, [])
    return (
        <React.Fragment>
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
HeaderPanel.propTypes = {};
function mapStateToProps(state) {
    return {
        isBuy: state.newOrder.isBuy
    }
}
export default connect(mapStateToProps)(HeaderPanel);
