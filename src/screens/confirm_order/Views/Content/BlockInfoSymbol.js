import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import ContentRowDefault from '~/screens/confirm_order/Components/RowInfoSymbol/ContentRowDefault.js'
import ContentRowClass from '~/screens/confirm_order/Components/RowInfoSymbol/ContentRowClass.js'
import ContentRowBuySell from '~/screens/confirm_order/Components/RowInfoSymbol/ContentRowBuySell.js'
import ContentRowOrderType from '~/screens/confirm_order/Components/RowInfoSymbol/ContentRowOrderType.js'

import * as Util from '~/util';
import * as ConfirmOrderController from '~/screens/confirm_order/Controllers/ContentController.js'
import * as Business from '~/business'
import Enum from '~/enum'
import { getAccActive, getPorfolioTypeByCode, getDicPortfolioType } from '~s/portfolio/Model/PortfolioAccountModel'
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController'
import { getObjectOrderPlace } from '~/screens/new_order/Controller/ContentController.js'

const { FORMAT_TIME } = Enum
const BlockInfoSymbol = ({ symbol, exchange, newOrder }) => {
    const displaySymbol = useMemo(() => {
        return Business.getDisplayName({ symbol })
    }, [symbol])
    const symbolClass = useMemo(() => {
        return Business.getClassBySymbolAndExchange({ symbol, exchange })
    }, [symbol, exchange])
    const displayName = useMemo(() => {
        return Business.getDisplayName({ symbol, exchange })
    }, [])
    const companyName = useMemo(() => {
        return Business.getCompanyName({ symbol, exchange })
    })
    return (
        <ContentRowDefault symbolClass={symbolClass} symbol={displayName} companyName={companyName} isBuy={newOrder.isBuy} />
    )
}
BlockInfoSymbol.propTypes = {}
BlockInfoSymbol.defaultProps = {}
function mapStateToProps(state) {
    return {
        isBuy: state.newOrder.isBuy,
        orderType: state.newOrder.orderType,
        limitPrice: state.newOrder.limitPrice,
        triggerPrice: state.newOrder.triggerPrice,
        duration: state.newOrder.duration, // GTD
        destination: state.newOrder.destination,
        quantity: state.newOrder.quantity,
        symbol: state.newOrder.symbol,
        exchange: state.newOrder.exchange,
        expiryTime: state.newOrder.expiryTime
    }
}
export default connect(mapStateToProps)(BlockInfoSymbol)
