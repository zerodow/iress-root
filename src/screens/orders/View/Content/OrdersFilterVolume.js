import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import {
    View, Text, TouchableOpacity
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { changeVolumeFilter } from '~s/orders/Model/OrdersModel'
import { sortAllCondition } from '~s/orders/Controller/OrdersController'
import { changeVolumeFilter as changeVolumeFilteRedux } from '~s/orders/Redux/actions'
import ENUM from '~/enum'

const { FILTER_CIRCLE_STATUS } = ENUM

const OrdersFilterVolume = () => {
    const status = useSelector(state => state.orders.volumeFilter, shallowEqual)
    const dispatch = useDispatch()
    const dic = useRef({
        timeout: null
    })
    const property = useMemo(() => {
        switch (status) {
            case FILTER_CIRCLE_STATUS.UP:
                return {
                    iconName: 'long-arrow-up',
                    iconColor: CommonStyle.color.buy,
                    iconStyle: {},
                    textStyle: { color: CommonStyle.color.modify, opacity: 1 }
                }
            case FILTER_CIRCLE_STATUS.DOWN:
                return {
                    iconName: 'long-arrow-down',
                    iconColor: CommonStyle.color.sell,
                    iconStyle: { paddingTop: 2 },
                    textStyle: { color: CommonStyle.color.modify, opacity: 1 }
                }
            default:
                return {
                    iconName: null,
                    iconColor: null,
                    iconStyle: {},
                    textStyle: {}
                }
        }
    }, [status])
    const changeStatus = useCallback(() => {
        let newStatus = status + 1
        if (status === FILTER_CIRCLE_STATUS.DOWN) {
            newStatus = 0
        }
        changeVolumeFilter({ status: newStatus })
        dispatch(changeVolumeFilteRedux(newStatus))
        dic.current.timeout && clearTimeout(dic.current.timeout)
        dic.current.timeout = setTimeout(sortAllCondition, 300)
    }, [status])
    const unmount = useCallback(() => {
        dic.current.timeout && clearTimeout(dic.current.timeout)
    }, [])
    useEffect(() => {
        return unmount
    }, [])
    return <TouchableOpacity
        onPress={changeStatus}
        style={{
            flexDirection: 'row',
            alignItems: 'center'
        }}>
        <Text style={[{
            marginRight: 4,
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font13,
            color: CommonStyle.fontColor,
            opacity: 0.5
        }, property.textStyle]}>
            {I18n.t('volume')}
        </Text>
        {
            property.iconName
                ? <FontAwesome
                    size={14}
                    name={property.iconName}
                    color={property.iconColor}
                    style={property.iconStyle}
                />
                : <View style={{ width: 6.3 }} />
        }
    </TouchableOpacity>
}

export default OrdersFilterVolume
