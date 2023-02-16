import React, { Component } from 'react';
import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Info from './Progressbar.info';

import CommonStyle from '~/theme/theme_controller';

export const DEFAULT_COLOR = CommonStyle.fontSilver;
export const UP_COLOR = CommonStyle.fontOceanGreen;
export const DOWN_COLOR = CommonStyle.fontNewRed;
export const NORMAL_COLOR = CommonStyle.fontColor;

const RADIUS = 8;

const Bar = ({ process, color }) => {
    const curProcess = process * 100 + '%';
    return (
        <View
            style={{
                backgroundColor: color,
                width: curProcess,
                height: 5,
                borderRadius: RADIUS
                // borderTopLeftRadius: RADIUS,
                // borderBottomLeftRadius: RADIUS
            }}
        />
    );
};

const Price = ({ style, onLayout, value, onTextLayout }) => (
    <View onLayout={onLayout} style={style}>
        <Text
            onLayout={onTextLayout}
            style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.font11,
                color: CommonStyle.fontWhite
            }}
        >
            {value}
        </Text>
    </View>
);

export default class Progressbar extends Component {
    renderTitle() {
        if (!this.props.title) return null;
        return (
            <Text
                style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    fontSize: CommonStyle.font11,
                    color: CommonStyle.fontWhite,
                    opacity: 0.5,
                    alignSelf: 'center',
                    paddingBottom: 4
                }}
            >
                {this.props.title}
            </Text>
        );
    }

    getInfo() {
        const {
            open: openPrice = 0,
            trade_price: tradePrice = 0,
            low = 0,
            high = 0
        } = this.props.quote || {};
        let minValue = low;
        let maxValue = high;
        let startBarValue = openPrice;
        let midValue = openPrice;
        let endBarValue = tradePrice;

        const isUpper = +tradePrice >= +openPrice;
        if (openPrice < low) {
            minValue = openPrice;
            midValue = low;
        }
        if (openPrice > high) {
            maxValue = openPrice;
            midValue = high;
        }

        return {
            isUpper,
            minValue,
            maxValue,
            startBarValue,
            endBarValue,
            midValue
        };
    }

    renderBarColor({
        isUpper,
        minValue,
        maxValue,
        startBarValue,
        endBarValue,
        endPercent
    }) {
        if (this.props.isLoading) return null;
        const { low = 0, high = 0 } = this.props.quote || {};

        if (low === high) {
            return (
                <View
                    style={{
                        position: 'absolute',
                        flexDirection: 'row',
                        width: '100%'
                    }}
                >
                    <Icon
                        name="md-arrow-dropright"
                        style={{
                            top: -10,
                            color: CommonStyle.fontWhite,
                            alignSelf: 'center',
                            fontSize: 24
                        }}
                    />
                </View>
            );
        }

        if (isUpper) {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <Bar
                        process={
                            (startBarValue - minValue) / (maxValue - minValue)
                        }
                    />

                    <Bar
                        process={
                            (endBarValue - startBarValue) /
                            (maxValue - minValue)
                        }
                        color={CommonStyle.fontOceanGreen}
                    />

                    <Bar
                        process={
                            (maxValue - endBarValue) / (maxValue - minValue)
                        }
                    />

                    <View
                        style={{
                            position: 'absolute',
                            flexDirection: 'row',
                            width: '100%'
                        }}
                    >
                        <View style={{ width: endPercent * 100 + '%' }} />
                        <Icon
                            name="md-arrow-dropleft"
                            style={{
                                top: -10,
                                right: 4,
                                color: CommonStyle.fontWhite,
                                alignSelf: 'center',
                                fontSize: 24
                            }}
                        />
                    </View>
                </View>
            );
        } else {
            return (
                <View style={{ flexDirection: 'row' }}>
                    <Bar
                        process={
                            (endBarValue - minValue) / (maxValue - minValue)
                        }
                    />

                    <Bar
                        process={
                            (startBarValue - endBarValue) /
                            (maxValue - minValue)
                        }
                        color={CommonStyle.fontNewRed}
                    />

                    <Bar
                        process={
                            (maxValue - startBarValue) / (maxValue - minValue)
                        }
                    />

                    <View
                        style={{
                            position: 'absolute',
                            flexDirection: 'row',
                            width: '100%'
                        }}
                    >
                        <View style={{ width: endPercent * 100 + '%' }} />
                        <Icon
                            name="md-arrow-dropright"
                            style={{
                                top: -10,
                                color: CommonStyle.fontWhite,
                                alignSelf: 'center',
                                fontSize: 24
                            }}
                        />
                    </View>
                </View>
            );
        }
    }

    renderInfo(maxValue, minValue, midValue) {
        return (
            <View style={{ flexDirection: 'row', paddingTop: 4 }}>
                <Price value={maxValue} />
                <Price
                    onLayout={this.onMidLayout}
                    onTextLayout={this.onMidTextLayout}
                    style={{ flex: 1, paddingHorizontal: 8 }}
                    value={minValue}
                />
                <Price value={midValue} />
            </View>
        );
    }

    render() {
        const { low = 0, high = 0 } = this.props.quote || {};

        // if (previousClose === tradePrice) return null;

        const {
            isUpper,
            minValue,
            maxValue,
            startBarValue,
            endBarValue,
            midValue
        } = this.getInfo();

        const startPercent = (startBarValue - minValue) / (maxValue - minValue);
        const endPercent = (endBarValue - minValue) / (maxValue - minValue);

        return (
            <View>
                {this.renderTitle()}
                <View
                    style={{
                        width: '100%',
                        height: 5,
                        borderRadius: RADIUS
                    }}
                >
                    <View
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundColor: this.props.processBg,
                            opacity: 0.3,
                            borderRadius: RADIUS
                        }}
                    />
                    {this.renderBarColor({
                        isUpper,
                        minValue,
                        maxValue,
                        startBarValue,
                        endBarValue,
                        endPercent
                    })}
                </View>
                <Info
                    isLoading={this.props.isLoading}
                    minValue={low}
                    maxValue={high}
                    midValue={midValue}
                    movePercent={startPercent}
                />
            </View>
        );
    }
}

Progressbar.defaultProps = {
    processColor: CommonStyle.color.success,
    processBg: '#fff'
};
