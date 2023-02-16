import React, { useEffect, useState, useCallback, useLayoutEffect, useRef, useContext, useMemo } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Animated, { Easing } from 'react-native-reanimated';

import Content from '~/screens/new_order/View/Content/Content.js'
import HandleLoadingComp, {
    STATE
} from '~/component/BoxLoading/HandleLoading.js';
import HandleDataComponent from './HandleData'
import HandleDisabledButtonConfirm from '~/screens/new_order/HandleDisabledButtonConfirm.js'
import { changeSymbolExchange } from '~/screens/new_order/Redux/actions.js';
import { getType } from '~/screens/new_order/Model/OrderEntryModel.js'
import * as Controller from '~/memory/controller';
import * as Business from '~/business'
import { dataStorage } from '~/storage';
import Enum from '~/enum'
import ScreenId from '~/constants/screen_id';
export const NewOrderContext = React.createContext({});
const {
    Clock,
    Value,
    set,
    cond,
    startClock,
    clockRunning,
    timing,
    debug,
    stopClock,
    block,
    eq
} = Animated;
const { Provider, Consumer } = NewOrderContext;
const HandleLoadingCompConnect = connect((state) => {
    const { isLoading } = state.newOrder;
    return {
        loadingState: isLoading
    };
})(HandleLoadingComp);
const NewOrder = ({ symbol, exchange, _scrollValue, navigator, forwardContext }) => {
    useEffect(() => {
        Controller.dispatch(changeSymbolExchange({ symbol, exchange }))
        dataStorage.currentScreenId = ScreenId.ORDER
        Business.showButtonConfirm()
    }, [])
    return (
        <React.Fragment>
            {getType() !== Enum.AMEND_TYPE.DEFAULT && <HandleDisabledButtonConfirm />}
            <Content {...{ symbol, _scrollValue, exchange, navigator }} />
        </React.Fragment>
    )
}
NewOrder.propTypes = {}
NewOrder.defaultProps = {}
export default NewOrder
