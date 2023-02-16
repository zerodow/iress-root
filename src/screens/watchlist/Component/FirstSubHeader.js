import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

export const SIZE = 35

export default class FirstSubHeader extends Component {
    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                {this.props.children}
            </View>
        )
    }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
        minHeight: SIZE,
        borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
        overflow: 'hidden',
        paddingRight: SIZE,
        backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2
    }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
