import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text } from 'react-native'
import SelectionButton from '~/component/Selection/SelectionButton.js'
import InputDate from '~/screens/new_order/View/Content/ListInput/InputPrice/TradingStategy/InputOfStopLoss/StopLossInputDate.js'

import { connect, useSelector, shallowEqual, useDispatch } from 'react-redux'
import { changeDurationSL, changeDatePeriod } from '~/screens/new_order/Redux/actions.js'

import * as AttributeModel from '~/screens/new_order/Model/AttributeModel.js'
import I18n from '~/modules/language/'
import Enum from '~/enum'
import { createSelector } from 'reselect'
const { DURATION_CODE } = Enum
const selectState = createSelector(
    state => state.newOrder,
    newOrder => ({
        isLoadingOrderAttribute: newOrder.isLoadingOrderAttribute,
        duration: newOrder.stopPrice.duration,
        layout: newOrder.layout
    })
)
function StopLossDuration(props) {
    const { disabled } = props
    const { isLoadingOrderAttribute, duration, layout } = useSelector(selectState, shallowEqual)
    const dispatch = useDispatch()
    const changeDuration = useCallback((p) => {
        dispatch(changeDurationSL(p))
    }, [])
    const listDuration = useMemo(() => {
        if (!isLoadingOrderAttribute) {
            const orderDurationMap = AttributeModel.getOrderDuration(true)
            const tmp = []
            for (let [key, value] of orderDurationMap) {
                tmp.push({
                    key: key,
                    label: value
                })
            }
            if (tmp.length === 1) {
                console.info('listDuration', tmp[0])
                changeDuration && changeDuration(tmp[0])
            }
            return tmp
        }
        return []
    }, [isLoadingOrderAttribute])
    // Lifecycle

    if (duration.key === DURATION_CODE.GTT || duration.key === DURATION_CODE.DATE || duration.key === DURATION_CODE.GTD) return <InputDate layout={layout} title={I18n.t('lifeTime')} data={listDuration} />
    return <SelectionButton
        disabled={disabled}
        layout={layout}
        data={listDuration}
        title={I18n.t('lifeTime')}
        defaultValue={duration}
        onCbSelect={(value, selectedObject) => {
            changeDuration && changeDuration(selectedObject)
        }} />
}

export default StopLossDuration
