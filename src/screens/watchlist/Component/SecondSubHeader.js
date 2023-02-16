import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import { SIZE } from './FirstSubHeader';

export const keyAnimator = 'SecondSubHeader';

export default class FirstSubHeader extends Component {
    render() {
        return (
            <View
                style={[styles.container, this.props.style]}
                ref={this.props.setRef}
            >
                <Animated.View {...this.props.aniProps}>
                    <Animated.View style={[styles.bg, this.props.bgAni]} />
                    {this.props.children}
                </Animated.View>
            </View>
        );
    }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
        minHeight: SIZE / 2,
        justifyContent: 'center',
        zIndex: -9
    },
    bg: {
        width: '120%',
        top: -SIZE * 10,
        bottom: 0,
        right: -5,
        borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
        overflow: 'hidden',
        paddingRight: SIZE,
        backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor3,
        position: 'absolute'
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
