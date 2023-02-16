import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types'
import { useShadow } from '~/component/shadow/SvgShadow'
import Shadow from '~/component/shadow';
import CommonStyle from '~/theme/theme_controller'
import Header from '~/screens/watchlist/Detail/components/HeaderPanner.js'
import OrderError from '~/component/Error/OrderError.js'
import { Navigation } from 'react-native-navigation';
import * as Business from '~/business'
import { connect } from 'react-redux'
import ENUM from '~/enum'
const { ID_ELEMENT, SYMBOL_CLASS, SYMBOL_CLASS_QUERY, NAME_PANEL } = ENUM;
const HeaderPanel = ({ symbol, exchange, forwardContext, styleHeader, isHideShadow, isBuy }) => {
    const [BottomShadow, onLayout] = useShadow()
    useEffect(() => {
    })
    const [heightHeader, setHeightHeader] = useState(0)
    const callHeightHeader = useCallback((e) => {
        const { height } = e.nativeEvent.layout
        setHeightHeader(height)
        onLayout(e)
    }, [])
    return (
        <React.Fragment>
            <BottomShadow />
            <View onLayout={callHeightHeader}>
                <Header
                    isHideShadow={isHideShadow}
                    styleContent={{
                        borderBottomWidth: 0
                    }}
                    title={isBuy ? 'Place Buy Order' : 'Place Sell Order'}
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
            <OrderError />

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
