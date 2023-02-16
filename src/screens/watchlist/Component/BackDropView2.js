import React, { Component } from 'react';
import { Dimensions, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import _ from 'lodash';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

const { height: heightDevice, width: widthDevice } = Dimensions.get('window');

const TRANS = Platform.OS === 'ios' ? heightDevice : heightDevice - 24;

const { Value, add, interpolate, sub } = Animated;

export default class BackDropView extends Component {
    constructor(props) {
        super(props);
        this._heightContainer = new Value(0);
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     return (
    //         !_.isEqual(this.props, nextProps) ||
    //         !_.isEqual(this.state, nextState)
    //     );
    // }

    onContainerLayout = this.onContainerLayout.bind(this);
    onContainerLayout(e) {
        const { height } = e.nativeEvent.layout;
        this._heightContainer.setValue(height);
    }

    getSpaceTop() {
        const { spaceTop } = this.props;
        if (typeof spaceTop === 'number') {
            return new Value(spaceTop);
        }
        return spaceTop;
    }

    getOpacity(translateY, spaceTop) {
        const { opacityInterpolate } = this.props;

        if (opacityInterpolate) {
            return opacityInterpolate(translateY);
        }
        return interpolate(translateY, {
            inputRange: [-1, 0, spaceTop, add(spaceTop, 1)],
            outputRange: [1, 1, 0, 0]
        });
    }

    render() {
        let translateY = new Value(0);
        let translateX = new Value(0);
        if (this.props._scrollValue) {
            translateY = interpolate(this.props._scrollValue, {
                inputRange: [-1, 0, 1],
                outputRange: [0, 0, 1]
            });
            translateX = interpolate(this.props._scrollValue, {
                inputRange: [
                    heightDevice - 2,
                    heightDevice - 1,
                    heightDevice,
                    heightDevice + 1
                ],
                outputRange: [0, 0, widthDevice, widthDevice]
            });
        }
        const spaceTop = this.getSpaceTop();
        const opacityAni = this.getOpacity(translateY, spaceTop);

        const iconTranslateY = sub(spaceTop, TRANS);
        const bgTranslateY = add(iconTranslateY, 100);

        return (
            <React.Fragment>
                <Animated.View
                    onLayout={this.onContainerLayout}
                    style={[
                        styles.container,
                        {
                            opacity: opacityAni,
                            transform: [
                                { translateY },
                                { translateY: bgTranslateY },
                                { translateX }
                            ]
                        }
                    ]}
                />
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
        );
    }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    dragIcon: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 8
    },
    container: {
        position: 'absolute',
        height: heightDevice + 100,
        width: '100%',
        backgroundColor: CommonStyle.backgroundColor,
        alignItems: 'center',
        justifyContent: 'flex-end'
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

BackDropView.defaultProps = {
    spaceTop: 0
};
