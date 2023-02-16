import React, { Component } from 'react';
import Animated from 'react-native-reanimated';
import { Text, View } from 'react-native';

import CommonStyle from '~/theme/theme_controller';
const {
    Value,
    block,
    cond,
    and,
    sub,
    lessThan,
    greaterThan,
    multiply,
    set
} = Animated;

const TextAni = Animated.createAnimatedComponent(Text);

export default class ProgressbarInfo extends Component {
    _containerWidth = new Value(0);
    _midWidth = new Value(0);
    _midTextWidth = new Value(0);
    _minWidth = new Value(0);

    onContainerLayout = this.onContainerLayout.bind(this);
    onContainerLayout(e) {
        this._containerWidth.setValue(e.nativeEvent.layout.width);
    }

    onMidLayout = this.onMidLayout.bind(this);
    onMidLayout(e) {
        this._midWidth.setValue(e.nativeEvent.layout.width);
    }

    onMidTextLayout = this.onMidTextLayout.bind(this);
    onMidTextLayout(e) {
        this._midTextWidth.setValue(e.nativeEvent.layout.width);
    }

    onMinLayout = this.onMinLayout.bind(this);
    onMinLayout(e) {
        this._minWidth.setValue(e.nativeEvent.layout.width);
    }

    getTrans() {
        const { movePercent } = this.props;
        const _trans = new Value(100);
        const maxTrans = sub(this._midWidth, this._midTextWidth, 16); // sub paddingHorizontal 8
        const movePos = multiply(this._containerWidth, movePercent || 0);
        return block([
            set(_trans, sub(movePos, this._minWidth, this._midTextWidth)),
            cond(lessThan(_trans, 0), set(_trans, 0)),
            cond(greaterThan(_trans, maxTrans), set(_trans, maxTrans)),
            _trans
        ]);
    }

    getOpacity() {
        const result = new Value(0);
        // if (!this.props.movePercent) return result;
        return block([
            cond(
                and(
                    this._containerWidth,
                    this._midWidth,
                    this._midTextWidth,
                    this._minWidth
                ),
                set(result, 1)
            ),
            result
        ]);
    }

    renderMinValue() {
        const { minValue } = this.props;
        return (
            <Text
                onLayout={this.onMinLayout}
                style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    fontSize: CommonStyle.font11,
                    color: CommonStyle.fontWhite,
                    opacity: minValue ? 1 : 0
                }}
            >
                {minValue || 0}
            </Text>
        );
    }

    renderMatchComp() {
        const { minValue } = this.props;
        return (
            <View style={{ flexDirection: 'row', paddingTop: 4 }}>
                <Text
                    style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font11,
                        color: CommonStyle.fontWhite
                    }}
                >
                    {minValue}
                </Text>
            </View>
        );
    }

    renderMidValue() {
        const { maxValue, minValue, midValue } = this.props;
        if (
            maxValue === midValue ||
            minValue === midValue ||
            minValue === maxValue
        ) {
            return <View style={{ flex: 1 }} />;
        }
        return (
            <View
                onLayout={this.onMidLayout}
                style={{
                    paddingHorizontal: 8,
                    flex: 1,
                    flexDirection: 'row'
                }}
            >
                <TextAni
                    onLayout={this.onMidTextLayout}
                    style={{
                        transform: [
                            {
                                translateX: this.getTrans()
                            }
                        ],
                        // opacity: this.getOpacity(),
                        opacity: 0, // Hide middle value open
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font11,
                        color: CommonStyle.fontWhite
                    }}
                >
                    {midValue}
                </TextAni>
            </View>
        );
    }

    renderMaxValue() {
        const { minValue, maxValue } = this.props;
        if (minValue === maxValue) return null;
        return (
            <Text
                style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    fontSize: CommonStyle.font11,
                    color: CommonStyle.fontWhite
                }}
            >
                {maxValue}
            </Text>
        );
    }

    render() {
        const { maxValue, minValue } = this.props;
        // if (minValue === maxValue) {
        //     return this.renderMatchComp();
        // }

        return (
            <View
                style={{ flexDirection: 'row', paddingTop: 4 }}
                onLayout={this.onContainerLayout}
            >
                {this.renderMinValue()}
                {this.renderMidValue()}
                {this.renderMaxValue()}
            </View>
        );
    }
}
