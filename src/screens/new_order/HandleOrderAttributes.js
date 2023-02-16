import React, { useEffect, useState, useCallback, useMemo, useLayoutEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { func, dataStorage } from '~/storage';

import { getOrderAttributes } from '~/screens/new_order/Controller/ContentController.js'

import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js'
const HandleOrderAttributes = React.memo((props) => {
    useMemo(() => {
        const { symbol, exchange } = props
        AttributeModel.setExchange(exchange)
        AttributeModel.setSymbol(symbol)
    })
    useLayoutEffect(() => {
        dataStorage.getOrderAttributes = () => {
            getOrderAttributes(props)
        }
        getOrderAttributes(props)
        // const exchangePre = AttributeModel.getExchange()
        // const exchange = props.exchange
        // if (exchange && exchange !== exchangePre) {
        //     AttributeModel.setExchange(exchange)
        // }
    }, [])
    return null
}, () => true)
HandleOrderAttributes.propTypes = {}
HandleOrderAttributes.defaultProps = {}
const styles = StyleSheet.create({})
export default HandleOrderAttributes
