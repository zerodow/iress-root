import React, { Component } from 'react'
import { View, Text } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'

const { Value, block, cond, eq, set, sub } = Animated

export default class TextDotTail extends Component {
    constructor(props) {
        super(props)
        this.maxWidth = new Value(0)
        this.widthParent = new Value(0)
        this.widthId = new Value(0)
        this.isUpdateLayout = new Value(0)
    }

    handleOnLayoutContainer = (event) => {
        console.log('ONLAYOUT handleOnLayoutContainer', event.nativeEvent.layout.width, event.nativeEvent.layout.height)
        const { width } = event.nativeEvent.layout
        this.widthParent.setValue(width)
        this.isUpdateLayout.setValue(1)
    }

    handleOnLayoutContentId = (event) => {
        console.log('ONLAYOUT handleOnLayoutContentId', event.nativeEvent.layout.width, event.nativeEvent.layout.height)
        const { width } = event.nativeEvent.layout
        this.widthId.setValue(width)
        this.isUpdateLayout.setValue(1)
    }

    getMaxHeight = () => {
        return block([
            cond(eq(this.isUpdateLayout, new Value(1)), [
                set(this.maxWidth, sub(this.widthParent, this.widthId)),
                set(this.isUpdateLayout, new Value(0))
            ], [
            ]),
            this.maxWidth
        ])
    }

    render() {
        const { rightComp, leftText, leftTextStyle, leftTextProps, wrapperStyle } = this.props
        const maxHeight = this.getMaxHeight()
        return (
            <View onLayout={this.handleOnLayoutContainer} style={[wrapperStyle, { flex: 1, flexDirection: 'row', overflow: 'hidden' }]}>
                <Animated.Text {...leftTextProps} numberOfLines={1} style={[leftTextStyle, { maxWidth: maxHeight }]}>
                    {leftText}
                </Animated.Text>
                <View onLayout={this.handleOnLayoutContentId}>
                    {rightComp}
                </View>
            </View>
        )
    }
}
