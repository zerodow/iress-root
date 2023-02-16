import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import {
    View, Text, TouchableOpacity
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { setContingentFilter } from '~s/orders/Model/OrdersModel'
import { sortAllCondition } from '~s/orders/Controller/OrdersController'
import { changeVolumeFilter as changeVolumeFilteRedux } from '~s/orders/Redux/actions'
import ENUM from '~/enum'

const { FILTER_CIRCLE_STATUS } = ENUM

const OrdersFilterContingent = () => {
    const [status, setFilter] = useState(false)
    const dispatch = useDispatch()
    const dic = useRef({
        timeout: null
    })
    const property = useMemo(() => {
        return status ? {
            iconName: 'long-arrow-up',
            iconColor: CommonStyle.color.buy,
            iconStyle: {},
            textStyle: { color: CommonStyle.color.modify, opacity: 1 },
            containerStyle: {
                borderColor: CommonStyle.color.modify
            }
        } : {
                iconName: null,
                iconColor: null,
                iconStyle: {},
                textStyle: {},
                containerStyle: {}
            }
    }, [status])
    const changeStatus = useCallback(() => {
        setFilter(!status)
        setContingentFilter(!status ? FILTER_CIRCLE_STATUS.UP : FILTER_CIRCLE_STATUS.NONE)
        // dispatch(changeVolumeFilteRedux(newStatus))
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
        style={[{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: CommonStyle.color.dusk,
            borderRadius: 4,
            paddingHorizontal: 16
        }, property.containerStyle]}>
        <Text style={[{
            // marginRight: 4,
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeS,
            color: CommonStyle.fontColor,
            opacity: 0.7
        }, property.textStyle]}>
            {I18n.t('contingent')}
        </Text>
        {/* {
            property.iconName
                ? <FontAwesome
                    size={14}
                    name={property.iconName}
                    color={property.iconColor}
                    style={property.iconStyle}
                />
                : <View style={{ width: 6.3 }} />
        } */}
    </TouchableOpacity>
}

export default OrdersFilterContingent
