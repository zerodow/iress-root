
import React, { PureComponent } from 'react';
import { View } from 'react-native'
import Animated from 'react-native-reanimated'

import {
    Grid,
    NoText,
    QuantityText,
    PriceText,
    ItemSeparator
} from './components'
import CommonStyle from '~/theme/theme_controller';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import ENUM from '~/enum'
import { checkUndefined } from '~/business'

const { PRICE_DECIMAL } = ENUM

export default class Row extends PureComponent {
    getAniValue(value) {
        if (isNaN(value)) {
            value = 0
        }
        const {
            _value,
            itemDuration,
            itemDelay,
            numberListDelay,
            duration,
            index
        } = this.props
        if (!_value) return `${value}%`

        const firstDelay = numberListDelay * itemDelay
        const secondDelay = index * itemDelay
        let totalDelay = firstDelay + secondDelay
        totalDelay = totalDelay + itemDuration
        totalDelay = Math.min(totalDelay, duration)
        totalDelay = totalDelay - itemDuration

        const result = Animated.interpolate(_value, {
            inputRange: [totalDelay - 1, totalDelay, totalDelay + itemDuration, totalDelay + itemDuration + 1],
            outputRange: [0, 0, value, value]
        })
        return Animated.concat(result, '%')
    }

    render() {
        const { bid, ask } = this.props.item;
        return (
            <View
                style={{ flexDirection: 'row', height: 34, alignItems: 'center' }}
            >
                <Grid>
                    {
                        checkUndefined(bid.no)
                            ? <View />
                            : <NoText>{bid.no}</NoText>
                    }
                    {
                        checkUndefined(bid.quantity)
                            ? <View />
                            : <QuantityText>{formatNumberNew2(bid.quantity, PRICE_DECIMAL.VOLUME)}</QuantityText>
                    }
                    {
                        checkUndefined(bid.price)
                            ? <View />
                            : <PriceText>{formatNumberNew2(bid.price, PRICE_DECIMAL.IRESS_PRICE)}</PriceText>
                    }

                </Grid>

                <ItemSeparator />

                <Grid>
                    {
                        checkUndefined(ask.price)
                            ? <View />
                            : <PriceText isAsk>{formatNumberNew2(ask.price, PRICE_DECIMAL.IRESS_PRICE)}</PriceText>
                    }
                    {
                        checkUndefined(ask.quantity)
                            ? <View />
                            : <QuantityText>{formatNumberNew2(ask.quantity, PRICE_DECIMAL.VOLUME)}</QuantityText>
                    }
                    {
                        checkUndefined(ask.no)
                            ? <View />
                            : <NoText>{ask.no}</NoText>
                    }
                </Grid>

                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        position: 'absolute',
                        flexDirection: 'row'
                    }}
                >
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Animated.View
                            style={{
                                width: this.getAniValue(bid.percent * 100),
                                height: '100%',
                                backgroundColor: CommonStyle.fontGreen1,
                                opacity: 0.4,
                                borderTopLeftRadius: 8,
                                borderBottomLeftRadius: 8
                            }}
                        />
                    </View>
                    <View style={{ width: 1 }} />
                    <View style={{ flex: 1 }}>
                        <Animated.View
                            style={{
                                width: this.getAniValue(ask.percent * 100),
                                height: '100%',
                                backgroundColor: CommonStyle.fontRed1,
                                opacity: 0.4,
                                borderTopRightRadius: 8,
                                borderBottomRightRadius: 8
                            }}
                        />
                    </View>
                </View>
            </View >
        );
    }
}
