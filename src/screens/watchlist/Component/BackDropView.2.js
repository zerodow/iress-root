import React, { Component } from 'react';
import { Dimensions, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import _ from 'lodash';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '~s/watchlist/enum';
import { useUpdateChangeTheme } from '~/component/hook';

const { height: heightDevice, width: widthDevice } = Dimensions.get('window');

const TRANS = Platform.OS === 'ios' ? heightDevice : heightDevice - 24;

const { Value, block, interpolate, debug } = Animated;

let BackDropView = ({ _scrollValue }) => {
    useUpdateChangeTheme()
    const opacity = interpolate(_scrollValue, {
        inputRange: [-1, 0, DEVICE_HEIGHT, DEVICE_HEIGHT + 1],
        outputRange: [1, 1, 0, 0]
    });

    const translateX = interpolate(_scrollValue, {
        inputRange: [
            DEVICE_HEIGHT - 2,
            DEVICE_HEIGHT - 1,
            DEVICE_HEIGHT,
            DEVICE_HEIGHT + 1
        ],
        outputRange: [0, 0, DEVICE_WIDTH, DEVICE_WIDTH]
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateX }]
                }
            ]}
        />
    );
};

BackDropView = React.memo(BackDropView);
export default BackDropView;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: CommonStyle.backgroundColor,
        height: DEVICE_HEIGHT,
        justifyContent: 'flex-end',
        position: 'absolute',
        width: '100%'
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
