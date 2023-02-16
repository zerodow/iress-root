import React, { Component } from 'react'
import { View } from 'react-native'
import Animated from 'react-native-reanimated'

import Row from './row'
import { HeaderText } from '../martketDepth/components';
import I18n from '~/modules/language';

const {
    block,
    call,
    cond,
    eq,
    diff,
    lessThan,
    Value,
    set
} = Animated;

export default class Header extends Component {
    constructor(props) {
        super(props)
        const { actived, _value } = this.props

        const inputRange = [-1, 0, 300, 300 + 1]
        const df = diff(actived)
        const fromLeft = lessThan(df, 0)

        const outputValue = new Value(50)

        this.translateX = block([
            cond(fromLeft, set(outputValue, -50)),
            Animated.interpolate(_value, {
                inputRange,
                outputRange: [outputValue, outputValue, 0, 0]
            })
        ])

        this.opacity = Animated.interpolate(_value, {
            inputRange,
            outputRange: [0, 0, 1, 1]
        })
    }

    render() {
        return (
            <Animated.View style={{
                opacity: this.opacity,
                transform: [{ translateX: this.translateX }]
            }}>
                <Row>
                    <HeaderText>{I18n.t('filledTimeUpper')}</HeaderText>
                    <HeaderText>{I18n.t('sideUpper')}</HeaderText>
                    <HeaderText>{I18n.t('quantityUpper')}</HeaderText>
                    <HeaderText>{I18n.t('filledCoS')}</HeaderText>
                </Row>

                <View style={{ height: 1, backgroundColor: '#363c4e' }} />
            </Animated.View>
        )
    }
}
