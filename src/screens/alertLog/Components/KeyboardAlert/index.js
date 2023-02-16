import React, { useEffect, useState, useCallback, useContext } from 'react'
import { View, Text } from 'react-native'
import Animated from 'react-native-reanimated'
import * as Emitter from '@lib/vietnam-emitter';
import { connect, useSelector, shallowEqual } from 'react-redux'
import { changeLoadingCheckVetting } from '~/screens/new_order/Redux/actions.js'
import ButtonClearAlert from '~/screens/alertLog/Components/Button/ButtonCreateAlert';

import Keyboard from '~s/alertLog/Components/KeyboardAlert/Keyboadrd'
import CommonStyle from '~/theme/theme_controller'
import ENUM from '~/enum'

const KeyboardAlert = (props) => {
    const {
        isConnected,
        inputFocus,
        navigator,
        symbol,
        exchange
    } = props
    let { forceDisabledButton } = props
    const isLoadingOrderAttribute = useSelector(state => state.newOrder.isLoadingOrderAttribute, shallowEqual)
    forceDisabledButton = isLoadingOrderAttribute || forceDisabledButton
    const renderMidleComp = useCallback(() => {
        return (
            <ButtonClearAlert
                symbol={symbol}
                exchange={exchange}
                backgroundColor={CommonStyle.color.modify}
                title={'newAlert'}
            />
        )
    }, [inputFocus])
    return (
        <React.Fragment>
            <Keyboard
                forceDisabled={forceDisabledButton}
                renderMidleComp={renderMidleComp}
                titleButton={'newAlert'}
                isConnected={isConnected}
                symbol={symbol}
                exchange={exchange}
                {...props} />
        </React.Fragment>
    )
}
function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected,
        inputFocus: state.newOrder.inputFocus,
        forceDisabledButton: state.newOrder.forceDisabledButton
    }
}

export default connect(mapStateToProps)(KeyboardAlert)
