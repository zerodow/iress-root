import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { getType, isAmend } from '~/screens/new_order/Model/OrderEntryModel.js'
import TradingStategyAmend from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/TradingStategyAmend.js'
import TradingStrategyCreate from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/TradingStrategyCreate.js'
import { useSelector } from 'react-redux'
const Index = () => {
    const accActive = useSelector(state => state.portfolio.accActive)
    return isAmend() ? (
        <TradingStategyAmend key={accActive} />
    ) : (<TradingStrategyCreate key={accActive} />)
}

Index.propTypes = {}
Index.defaultProps = {}
const styles = StyleSheet.create({})
export default Index
