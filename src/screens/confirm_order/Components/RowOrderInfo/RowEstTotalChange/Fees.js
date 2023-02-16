import React, { useCallback, useState } from 'react'
import { Text, View, TouchableOpacity, Platform } from 'react-native'
import {
    formatNumberNew2
} from '~/lib/base/functionUtil';
import CommonStyle from '~/theme/theme_controller'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import I18n from '~/modules/language/'
import { styles } from './style'
import Enum from '~/enum'
import Icon from 'react-native-vector-icons/FontAwesome'
import { calculateLineHeight } from '~/util'
import { convertedCurrentcyFormat } from '~s/confirm_order/Controllers/ContentController'
const RowFees = ({ name, toCurrency, value }) => {
    return (
        <React.Fragment key={name}>
            <View style={styles.orderStyle}>
                <Text numberOfLines={1} style={[styles.txtStyleFees, { flex: 1 }, Platform.OS === 'ios' ? {} : { lineHeight: calculateLineHeight(CommonStyle.fontTiny) }]}>
                    {name && (name + ` (${toCurrency})`)}
                </Text>
                <Text style={[styles.txtStyleFees]}>
                    {formatNumberNew2(convertedCurrentcyFormat(value), Enum.PRICE_DECIMAL.VALUE)}
                </Text>
            </View>
        </React.Fragment>
    )
}

const Fees = ({ fees, isLoading, toCurrency, dataFees }) => {
    const [isShow, setShow] = useState(false)
    const arrayFee = dataFees.array_fee || []
    const onChangeShowFees = () => {
        if (arrayFee.length !== 0) {
            setShow(e => !e)
        } else {
            setShow(false)
        }
    }
    const ListFees = useCallback(({ isShow, toCurrency, arrayFee }) => {
        return (isShow) ? (
            <View>
                {
                    arrayFee.map(item => {
                        if (!item.fee_value) return null;
                        return (
                            <RowFees name={item.fee_name} toCurrency={toCurrency} value={item.fee_value} />
                        )
                    })
                }
            </View>
        ) : null
    }, [isShow])

    return (
        <TouchableOpacity onPress={onChangeShowFees}>
            <View style={styles.orderStyle}>
                <Icon
                    style={{ position: 'absolute', left: 8, top: 0 }}
                    name={isShow ? 'angle-down' : 'angle-right'}
                    size={16}
                    color={CommonStyle.fontNearLight6}
                />
                <Text style={[styles.txtOrderStyle, { paddingLeft: isShow ? 8 : 0 }]}>{I18n.t('fees_aud') + ` (${toCurrency})`}</Text>
                <TextLoading isLoading={isLoading} style={[styles.txtOrderStyle]}>{formatNumberNew2(convertedCurrentcyFormat(fees), Enum.PRICE_DECIMAL.VALUE)}</TextLoading>
            </View>
            <ListFees isShow={isShow} toCurrency={toCurrency} arrayFee={arrayFee} />

        </TouchableOpacity>
    )
}

export default Fees
