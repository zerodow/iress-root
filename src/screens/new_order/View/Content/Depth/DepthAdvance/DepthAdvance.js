import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash';

import TabDepth from '~/screens/new_order/View/Content/Depth/DepthAdvance/TabDepth.js'

import BidChart from '~/screens/new_order/View/Content/Depth/DepthAdvance/BidChart.js'
import AskChart from '~/screens/new_order/View/Content/Depth/DepthAdvance/AskChart.js'
import PriceInfo from '~/screens/new_order/View/Content/Depth/DepthAdvance/components/PriceInfo.js'
import Title from '~/screens/new_order/View/Content/Depth/DepthAdvance/components/Title.js'

import * as TabModel from '~/screens/new_order/Model/TabModel.js'
import { checkDisabledChangeInput } from '~/screens/new_order/Model/OrderEntryModel.js'
import { useSelector, shallowEqual } from 'react-redux'
const DepthAdvance = ({ exchange, symbol }) => {
    const refScrollView = useRef()
    const [maxHeight, setMaxHeight] = useState(334)
    const dic = useRef({
        maxHeight: TabModel.model.maxHeight,
        timeoutScroll: null
    })
    const translateContent = useCallback(() => {
        setTimeout(() => {
            if (TabModel.model.depth === 'BID') {
                return refScrollView.current && refScrollView.current._component.scrollToEnd({ animated: true })
            }
            if (TabModel.model.depth === 'ASK') {
                return refScrollView.current && refScrollView.current._component.scrollTo({ x: 0, y: 0, animated: true })
            }
            console.info('translateContent', TabModel.model.rowDepthHeight)
            return refScrollView.current && refScrollView.current._component.scrollTo({ x: 0, y: TabModel.model.rowDepthHeight * 5, animated: true })
        }, 100);
    }, [])
    useEffect(() => {
        TabModel.model.translateContent = translateContent
        TabModel.model.changeMaxHeight = ({ isShowAll }) => {
            isShowAll = isShowAll ? TabModel.model.depth === 'ALL' && TabModel.model.trading.MORE_TAKE_PROFIT && TabModel.model.trading.MORE_STOPLOSS : isShowAll
            setMaxHeight(isShowAll ? dic.current.maxHeight * 2 : dic.current.maxHeight)
            translateContent()
        }
        if (TabModel.model.depth === 'BID') {
            TabModel.model.changeMaxHeight({ isShowAll: false })
        }
        if (TabModel.model.depth === 'ASK') {
            TabModel.model.changeMaxHeight({ isShowAll: false })
        }
        if (TabModel.model.depth === 'ALL') {
            TabModel.model.changeMaxHeight({ isShowAll: true })
        }
        // translateContent()
    }, [])
    const onChangeTab = useCallback((tab) => {
        TabModel.setDepthTab(tab.key)
        if (dic.current.timeoutScroll) {
            clearTimeout(dic.current.timeoutScroll)
            dic.current.timeoutScroll = null
        }
        switch (tab.key) {
            case 'BID':
                TabModel.model.changeMaxHeight({ isShowAll: false })
                dic.current.timeoutScroll = setTimeout(() => {
                    refScrollView.current._component.scrollToEnd({ animated: true })
                }, 100);
                break;
            case 'ALL':
                TabModel.model.changeMaxHeight({ isShowAll: true })
                dic.current.timeoutScroll = setTimeout(() => {
                    refScrollView.current._component.scrollTo({ x: 0, y: TabModel.model.rowDepthHeight * 5, animated: true })
                }, 100); break;
            case 'ASK':
                TabModel.model.changeMaxHeight({ isShowAll: false })
                dic.current.timeoutScroll = setTimeout(() => {
                    refScrollView.current._component.scrollTo({ x: 0, y: 0, animated: true })
                }, 100);
                break;

            default:
                break;
        }
    }, [])
    const heightAni = useMemo(() => new Animated.Value(374))
    const disabledFillPrice = useMemo(() => checkDisabledChangeInput())
    const handleOnLayout = useCallback((e) => {
        heightAni.setValue(e.nativeEvent.layout.height)
        console.info('DCM ', e.nativeEvent.layout.height)
    }, [])
    const { depth } = useSelector(state => {
        const key = `${symbol}#${exchange}`
        const { data } = state.depths || {}
        const depth = data[key]
        return {
            depth
        }
    }, shallowEqual)
    const extraData = useMemo(() => {
        if (_.isEmpty(depth)) return [];

        let { bid: Bid, ask: Ask } = depth || {};
        Bid = _.values(Bid)
        Ask = _.values(Ask)
        const { quantity: maxAsk = 1 } =
            _.maxBy(_.values(Ask), (o) => o.quantity) || {};
        const { quantity: maxBid = 1 } =
            _.maxBy(_.values(Bid), (o) => o.quantity) || {};

        const max = Math.max(maxBid, maxAsk);
        const quantity = 10
        let AskReverse = Ask.slice(0, quantity).reverse()
        const listData = [];
        for (let index = 0; index < quantity; index++) {
            const elementAsk = AskReverse[index] || {};

            const elementBid = Bid[index] || {};

            listData.push({
                ask: {
                    price: elementAsk.price,
                    quantity: elementAsk.quantity,
                    percent: elementAsk.quantity / max,
                    no: elementAsk.number_of_trades
                },
                bid: {
                    price: elementBid.price,
                    quantity: elementBid.quantity,
                    percent: elementBid.quantity / max,
                    no: elementBid.number_of_trades
                }
            });
        }

        return listData;
    }, [depth])
    const setRef = useCallback((ref) => {
        ref && ref.measure((x, y, w, h, pX, pY) => {
            if (h && Math.abs(dic.current.maxHeight - h) > 0) {
                console.info('h', h)
                const isShowAll = TabModel.model.depth === 'ALL' && TabModel.model.trading.MORE_TAKE_PROFIT && TabModel.model.trading.MORE_STOPLOSS
                dic.current.maxHeight = h
                TabModel.model.maxHeight = h
                setMaxHeight(isShowAll ? dic.current.maxHeight * 2 : dic.current.maxHeight)
            }
        })
    })
    return (
        <React.Fragment>
            <TabDepth onChangeTab={onChangeTab} />
            <Title />
            <Animated.ScrollView
                ref={refScrollView}
                scrollEnabled={false}
                style={{
                    maxHeight: maxHeight
                }} >
                <View
                    ref={setRef}
                    onLayout={handleOnLayout}
                >
                    <AskChart disabled={disabledFillPrice} data={extraData} />
                    <PriceInfo />
                </View>
                <BidChart disabled={disabledFillPrice} data={extraData} />
            </Animated.ScrollView>
        </React.Fragment >
    )
}
DepthAdvance.propTypes = {}
DepthAdvance.defaultProps = {}
const styles = StyleSheet.create({})
export default DepthAdvance
