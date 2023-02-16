import React, { useMemo, useCallback } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import { BidPriceValue, BidSizeValue, AskPriceValue, AskSizeValue } from './PriceInfo'

import { TYPE } from './BuySell'

function getColor(type) {
    switch (type) {
        case TYPE.BUY:
            return CommonStyle.fontOceanGreen
            break;
        default:
            return CommonStyle.color.sell
            break;
    }
}
export default function SellButton(props) {
    const { isActive, tradePrice, tradeSize, title, style, onPress, isDisable, type, symbol, exchange, loadingValue } = props
    const [colorStyle, backgroundStyle, borderColor] = useMemo(() => {
        const color = getColor(type)
        if (isDisable) {
            return [
                { color: CommonStyle.fontNearLight6 },
                { backgroundColor: CommonStyle.color.dusk },
                {
                    borderColor: CommonStyle.color.dusk,
                    borderWidth: 1
                }
            ]
        }
        if (isActive) {
            return [{
                color: CommonStyle.fontDark
            }, {
                backgroundColor: color
            }, {
                borderColor: color,
                borderWidth: 1
            }]
        } else {
            return [
                {
                    color: color
                },
                { backgroundColor: CommonStyle.backgroundColor },
                {
                    borderColor: color,
                    borderWidth: 1
                }
            ]
        }
    }, [isActive, isDisable])
    const handlePress = useCallback(() => {
        onPress && onPress()
    }, [])
    if (type === TYPE.SELL) {
        return (
            <TouchableOpacity disabled={isDisable} onPress={handlePress} style={[style, backgroundStyle, borderColor, { borderRadius: 16, padding: 8 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[
                        {
                            fontSize: CommonStyle.fontSizeM,
                            fontFamily: CommonStyle.fontPoppinsBold
                        },
                        colorStyle
                    ]}>{title}</Text>

                </View>
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity disabled={isDisable} onPress={handlePress} style={[style, backgroundStyle, borderColor, { borderRadius: 16, padding: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[
                    {
                        fontSize: CommonStyle.fontSizeM,
                        fontFamily: CommonStyle.fontPoppinsBold
                    },
                    colorStyle
                ]}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}
