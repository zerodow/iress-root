import React, { } from 'react'
import {
    View,
    Text
} from 'react-native'
import { useSelector } from 'react-redux'
import CommonStyle from '~/theme/theme_controller'
import { formatNumberNew2 } from '~/lib/base/functionUtil'
import ENUM from '~/enum'
import Icon from 'react-native-vector-icons/Ionicons';
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'

const { PRICE_DECIMAL } = ENUM

const UpDownIcon = ({ value, iconStyle }) => {
    let iconName = ''
    let iconColor = ''
    if (value > 0) {
        iconName = 'md-arrow-dropup'
        iconColor = CommonStyle.color.buy
    }
    if (value < 0) {
        iconName = 'md-arrow-dropdown'
        iconColor = CommonStyle.color.sell
    }
    if (!iconName) return null;
    if (iconName === 'md-arrow-dropup') {
        return <CommonStyle.icons.arrowUp
            name={iconName}
            size={6}
            color={iconColor}
            style={[
                CommonStyle.iconPickerUp,
                {
                    color: iconColor,
                    marginRight: 4,
                    alignSelf: 'center'
                },
                iconStyle
            ]}
        />
    }
    return <CommonStyle.icons.arrowDown
        name={iconName}
        size={6}
        color={iconColor}
        style={[
            CommonStyle.iconPickerUp,
            {
                color: iconColor,
                marginRight: 4,
                alignSelf: 'center'
            },
            iconStyle
        ]}
    />
}

const PercentFormat = ({
    value,
    decimal = PRICE_DECIMAL.PERCENT,
    wrapperStyle = {},
    textStyle = {},
    iconStyle = {},
    loadingStyle = {},
    hasPrefix = true,
    isLoading
}) => {
    let text = ''
    let color = CommonStyle.fontColor
    const defaultValueLoading = '123.456'
    const loadingInternal = isLoading === undefined || isLoading === null
        ? useSelector(state => state.portfolio.isLoading)
        : isLoading
    if (value === null || value === undefined) {
        text = '--'
        return <ViewLoading
            wrapperStyle={loadingStyle}
            isLoading={loadingInternal}>
            <View style={[{ flexDirection: 'row' }, wrapperStyle]}>
                <Text style={[{}, { color }, textStyle]}>
                    {loadingInternal ? defaultValueLoading : text}
                </Text>
            </View>
        </ViewLoading>
    }
    if (value > 0) {
        color = CommonStyle.color.buy
    }
    if (value < 0) {
        color = CommonStyle.color.sell
    }
    text += `${formatNumberNew2(value, decimal)}%`
    if (value === 0) {
        text = `0.${'0'.repeat(decimal)}%`
    }
    return <ViewLoading
        wrapperStyle={loadingStyle}
        isLoading={loadingInternal}>
        <View style={[{ flexDirection: 'row' }, wrapperStyle]}>
            {
                hasPrefix
                    ? <UpDownIcon value={value} iconStyle={iconStyle} />
                    : null
            }
            <Text style={[{}, { color }, textStyle]}>
                {loadingInternal ? defaultValueLoading : text}
            </Text>
        </View>
    </ViewLoading>
}

export default PercentFormat
