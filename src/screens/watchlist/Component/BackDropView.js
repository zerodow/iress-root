import React, { Component } from 'react'
import { Dimensions, StyleSheet, Platform } from 'react-native'
import Animated from 'react-native-reanimated';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

const { height: heightDevice } = Dimensions.get('window')

const TRANS = Platform.OS === 'ios' ? heightDevice : heightDevice - 24

const {
    Value,
    add,
    and,
    block,
    cond,
    greaterThan,
    interpolate,
    lessThan,
    not,
    set,
    sub
} = Animated;

export default class BackDropView extends Component {
    constructor(props) {
        super(props)
        this._heightContainer = new Value(0)
    }

    onContainerLayout = this.onContainerLayout.bind(this);
    onContainerLayout(e) {
        const { height } = e.nativeEvent.layout;
        this._heightContainer.setValue(height)
    }

    getTransY() {
        const { _scrollValue, _isScrollContent } = this.props
        const curValue = new Value(0)
        return block([
            cond(
                and(
                    greaterThan(_scrollValue, 0),
                    not(_isScrollContent)
                ),
                set(curValue, _scrollValue)
            ),
            cond(
                and(
                    lessThan(_scrollValue, 0),
                    not(_isScrollContent)
                ),
                set(curValue, 0)
            ),
            curValue
        ])
    }

    getSpaceTop() {
        const { spaceTop } = this.props
        if (typeof spaceTop === 'number') {
            return new Value(spaceTop)
        }
        return spaceTop
    }

    getOpacity(translateY, spaceTop) {
        const { opacityInterpolate } = this.props

        if (opacityInterpolate) {
            return opacityInterpolate(translateY)
        }
        return interpolate(translateY, {
            inputRange: [-1, 0, spaceTop, add(spaceTop, 1)],
            outputRange: [1, 1, 0, 0]
        })
    }

    render() {
        const translateY = this.getTransY()
        const spaceTop = this.getSpaceTop()
        const opacityAni = this.getOpacity(translateY, spaceTop)

        const iconTranslateY = sub(spaceTop, TRANS)
        const bgTranslateY = add(iconTranslateY, 24)

        return (
            <React.Fragment>
                <Animated.View
                    pointerEvents="none"
                    onLayout={this.onContainerLayout}
                    style={[
                        styles.container,
                        {
                            opacity: opacityAni,
                            transform: [
                                { translateY },
                                { translateY: bgTranslateY }
                            ]
                        }
                    ]}>
                </Animated.View>
                {/* <Animated.View style={[
                    CommonStyle.dragIcons,
                    styles.dragIcon,
                    {
                        transform: [
                            { translateY },
                            { translateY: iconTranslateY }
                        ]
                    }
                ]} /> */}
            </React.Fragment>
        )
    }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    dragIcon: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 4
    },
    container: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor:
            CommonStyle.backgroundColor,
        alignItems: 'center',
        justifyContent: 'flex-end'
    }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

BackDropView.defaultProps = {
    spaceTop: 0
}
