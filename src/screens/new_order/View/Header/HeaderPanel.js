import React, { useEffect, useState, useCallback, useMemo, useRef, useContext } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import HeaderPanel from '~/component/panel/HeaderPanel'
import TouchableDismissKeyboard from '~/component/virtual_keyboard/TouchableDismissKeyboard.js'
import HandleDataPrice, { HandleDataFake } from '../../HandleData'
import ScreenId from '~/constants/screen_id';
import Error from '~/component/error_system/Error.js'

import { getChannelChangeRealOrderError, getChannelHideOrderError, getChannelChangeOrderError, getChannelShowMessageNewOrder } from '~/streaming/channel'
import * as Business from '~/business'
import { func, dataStorage } from '~/storage';
import * as Controller from '~/memory/controller';
import Enum from '~/enum'
const { NAME_PANEL } = Enum
const HeaderNewOrder = ({ symbol, exchange, isLoading, navigator, onClose }) => {
    const listSymbol = symbol ? [{ symbol, exchange }] : [];
    const refHandleData = useRef()
    const handleC2R = useCallback(() => {
        Business.showButtonConfirm();
        dataStorage.getPortfolioBalance && dataStorage.getPortfolioBalance()
        dataStorage.getOrderAttributes && dataStorage.getOrderAttributes()
        refHandleData.current && refHandleData.current.getSnapshot && refHandleData.current.getSnapshot()
    }, [])
    const handleClose = useCallback(() => {
        dataStorage.isReloading = false
        Business.hideKeyboard();
        onClose && onClose(0)
    }, [])
    return (
        <TouchableDismissKeyboard>
            <View>
                <HeaderPanel
                    channelMessage={getChannelShowMessageNewOrder()}
                    titleStyle={{
                        paddingHorizontal: 8
                    }}
                    onClose={handleClose}
                    // onClickToRefresh={handleC2R}
                    title={Business.getCompanyName({ symbol, exchange })}
                    isLoading={isLoading}
                />
                <Error screenId={ScreenId.ORDER} onReTry={handleC2R} />
                {dataStorage.isNeedSubSymbolOnNewOrder ? <HandleDataPrice ref={refHandleData} isDetail userId={Controller.getUserId()} navigator={navigator} listSymbol={listSymbol} /> : <HandleDataFake />}
            </View>
        </TouchableDismissKeyboard>

    )
        ;
}
HeaderNewOrder.propTypes = {};
function mapStateToProps(state) {
    return {
        isLoading: state.newOrder.isLoading
    }
}
export default connect(mapStateToProps)(HeaderNewOrder);
