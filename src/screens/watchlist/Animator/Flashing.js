import React, { Component } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';

import Animations from '~s/watchlist/Animator/Animations';
import CommonStyle, { register } from '~/theme/theme_controller';
import FlashingStyle from '~/component/flashing/flashing_style';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import Enum from '~/enum';

const {
    Value,
    block,
    cond,
    greaterThan,
    set,
    color,
    interpolate,
    not
} = Animated;

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const hexToRgbA = hex => {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');

        return color((c >> 16) & 255, (c >> 8) & 255, c & 255, 1);
    }
    throw new Error('Bad Hex');
};

const UP_COLOR = hexToRgbA(CommonStyle.fontGreen1);
const DOWN_COLOR = hexToRgbA(CommonStyle.fontRed1);
const DURATION = 250;

const wrapColor = (timer, flag, resetKey) => {
    const val = new Value(0);
    const created = new Value(0);
    // cond(this.isUpper, UP_COLOR, DOWN_COLOR),

    return block([
        cond(created, [], [set(created, 1), set(val, UP_COLOR)]),
        cond(resetKey, [set(resetKey, 0), set(val, UP_COLOR)]),
        cond(
            greaterThan(timer, DURATION / 2),
            cond(flag, set(val, UP_COLOR), set(val, DOWN_COLOR))
        ),
        val
    ]);
};

export default class Flashing extends Component {
    constructor(props) {
        super(props);
        this.isUpper = new Value(0);
        this._timer = new Value(0);
        this.backgroundColor = new Value(0);
        this.mesure = {
            x: new Value(0),
            y: new Value(0),
            width: new Value(0),
            height: new Value(0)
        };
        this.resetKey = new Value(0);

        this.color = wrapColor(this._timer, this.isUpper, this.resetKey);

        this.backgroundColor = wrapColor(
            this._timer,
            this.isUpper,
            // cond(this.isUpper, UP_COLOR, DOWN_COLOR),
            this.resetKey
        );

        this.opacity = interpolate(this._timer, {
            inputRange: [0, DURATION / 2, DURATION],
            outputRange: [0, 1, 0]
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value !== nextProps.value) {
            const nextValue = nextProps.value ? +nextProps.value : 0;
            const preValue = this.props.value ? +this.props.value : 0;
            this.isUpper.setValue(nextValue - preValue > 0 ? 1 : 0);
        }

        if (this.props.symbol !== nextProps.symbol || !this.props.value) {
            this.resetKey.setValue(1);
        }

        if (this.props.value !== nextProps.value && !nextProps.isLoading) {
            this._ani && this._ani.start();
        }
    }

    setRefAni = this.setRefAni.bind(this);
    setRefAni(sef) {
        this._ani = sef;
    }

    onLayout = this.onLayout.bind(this);
    onLayout({
        nativeEvent: {
            layout: { x, y, width, height }
        }
    }) {
        this.mesure.x.setValue(x);
        this.mesure.y.setValue(y);
        this.mesure.width.setValue(width);
        this.mesure.height.setValue(height);
    }

    renderNoneValue() {
        const { defaultValue, typeFormRealtime } = this.props;
        const { text: textStyle } = FlashingStyle[typeFormRealtime] || {};
        let disValue = defaultValue || '--';
        if (defaultValue === '') {
            disValue = '';
        }
        return (
            <Text
                style={[
                    textStyle,
                    {
                        paddingHorizontal: 4,
                        textAlign: 'right'
                    },
                    this.props.textStyle
                ]}
            >
                {disValue}
            </Text>
        );
    }

    render() {
        if (this.props.value || this.props.value === '') {
            const value = formatNumberNew2(
                this.props.value,
                PRICE_DECIMAL.PRICE
            );
            const { typeFormRealtime } = this.props;

            const { text: textStyle } = FlashingStyle[typeFormRealtime] || {};

            return (
                <View>
                    <Animations
                        duration={DURATION}
                        ref={this.setRefAni}
                        value={this._timer}
                    />
                    <Animated.Text
                        onLayout={this.onLayout}
                        style={[
                            textStyle,
                            this.props.textStyle,
                            {
                                color: this.color
                            }
                        ]}
                    >
                        {value}
                    </Animated.Text>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            borderRadius: 8,
                            left: this.mesure.x,
                            bottom: this.mesure.y,
                            width: this.mesure.width,
                            height: this.mesure.height,
                            backgroundColor: this.backgroundColor,
                            opacity: this.opacity
                        }}
                    />
                </View>
            );
        }
        return this.renderNoneValue();
    }
}
