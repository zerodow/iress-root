import React, { useEffect, useState, useCallback, useContext } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/Ionicons';

import BoxLoading from '~/component/BoxLoading/BoxLoading.js'
import { NewOrderContext } from '~/screens/new_order/NewOrder.js'

import CommonStyle, { register } from '~/theme/theme_controller'
import * as FuncUtil from '~/lib/base/functionUtil';
import Enum from '~/enum';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;
export const DEFAULT_COLOR = CommonStyle.fontSilver;
export const UP_COLOR = CommonStyle.fontOceanGreen;
export const DOWN_COLOR = CommonStyle.fontNewRed;
export const NORMAL_COLOR = CommonStyle.fontColor;
export const ChangePercent = ({ style, value, colorFlag }) => {
    let color = DEFAULT_COLOR;
    let title = ' --';
    let iconContent = null;
    if (value) {
        if (colorFlag || colorFlag === 0) {
            if (+colorFlag >= 0) {
                color = CommonStyle.fontOceanGreen;
                iconContent = (
                    <CommonStyle.icons.arrowUp
                        name="md-arrow-dropup"
                        size={6}
                        color={CommonStyle.hightLightColorUp}
                        style={[
                            CommonStyle.iconPickerUp,
                            {
                                color: CommonStyle.hightLightColorUp,
                                marginRight: 4,
                                alignSelf: 'center'
                            }
                        ]}
                    />
                );
            } else {
                color = CommonStyle.fontNewRed;
                iconContent = (
                    <CommonStyle.icons.arrowDown
                        name="md-arrow-dropdown"
                        size={6}
                        color={CommonStyle.hightLightColorDown}
                        style={[
                            CommonStyle.iconPickerDown,
                            {
                                color: CommonStyle.hightLightColorDown,
                                marginRight: 4,
                                alignSelf: 'center'
                            }
                        ]}
                    />
                );
            }
        }
        title = ' ';
        title += FuncUtil.formatNumberNew2(value, PRICE_DECIMAL.PERCENT);
        title += '%';
    } else {
        iconContent = (
            <Icon
                name="md-arrow-dropdown"
                size={6}
                style={[
                    CommonStyle.iconPickerDown,
                    {
                        color: CommonStyle.hightLightColorDown,
                        marginRight: 4,
                        alignSelf: 'center',
                        opacity: 0
                    }
                ]}
            />
        );
    }

    if (value === 0) {
        color = CommonStyle.fontWhite;
        title = '0.00%';
    }
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {iconContent}
            <Text
                numberOfLines={1}
                textAlign="right"
                style={[
                    {
                        fontFamily: CommonStyle.fontPoppinsMedium,
                        fontSize: CommonStyle.fontSizeS,
                        color
                    },
                    style
                ]}
            >
                {title}
            </Text>
        </View>
    )
}
