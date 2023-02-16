import React, { useEffect, useMemo } from 'react'
import { View, Text } from 'react-native'
import SelectionButton from '~/component/Selection/SelectionButton.js'

import { connect } from 'react-redux'
import { changeDestination } from '~/screens/new_order/Redux/actions.js'

import { getDuration, getFormatData, getExchange } from '~/screens/new_order/Controller/ContentController.js'
import Enum from '~/enum'
import CommonStyle, { register } from '~/theme/theme_controller'
function useGetOrderListDestination({ isAuBySymbol, classSymbol, isNSXSymbol, changeDestination, isFuture, symbol, orderType, duration, isBuy, exchange }) {
    return useMemo(() => {
        let listDestination = getExchange({ isAuBySymbol, classSymbol, isNSXSymbol, symbol, orderType, isFuture, duration, exchange }) || {};
        if (!listDestination.listExchange) return {}
        if (listDestination.listExchange.length) {
            changeDestination && changeDestination(listDestination.listExchange[0] && listDestination.listExchange[0].value)
            return {
                listExchange: listDestination.listExchange.map(el => ({ key: el.value, label: el.label }))
            }
        }
        return listDestination
    }, [symbol, orderType, isBuy, duration])
}
function getDestinationDefault({ listDestination, key }) {
    return listDestination.find(el => el.key === key) || listDestination[0]
}
function DestinationInput(props) {
    const { isAuBySymbol, classSymbol, isNSXSymbol, changeDuration, isFuture, symbol, orderType, duration, changeDestination, isBuy, exchange, destination } = props
    const { listExchange: listDestination } = useGetOrderListDestination({
        isAuBySymbol,
        classSymbol,
        isNSXSymbol,
        changeDuration,
        symbol,
        isFuture,
        orderType,
        duration,
        changeDestination,
        isBuy,
        exchange
    })

    if (!listDestination) return null
    const defaultValue = useMemo(() => {
        return getDestinationDefault({
            listDestination,
            key: destination
        })
    }, [destination])
    return <SelectionButton
        styleValue={{
            fontFamily: CommonStyle.fontPoppinsRegular
        }}
        onCbSelect={(value) => {
            changeDestination && changeDestination(value)
        }}
        defaultValue={defaultValue}
        data={listDestination}
        title={'Destination'}
        onShow={() => { }}
        onHide={() => { }}
    />
}
function mapStateToProps(state) {
    return {
        orderType: state.newOrder.orderType,
        duration: state.newOrder.duration,
        isBuy: state.newOrder.isBuy,
        destination: state.newOrder.destination
    }
}
function mapActionToProps(dispatch) {
    return {
        changeDestination: params => dispatch(changeDestination(params))
    }
}
export default connect(mapStateToProps, mapActionToProps)(DestinationInput)
