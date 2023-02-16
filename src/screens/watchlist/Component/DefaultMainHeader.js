import React, { Component } from 'react'
import { Dimensions, StyleSheet, Text } from 'react-native'

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { width } = Dimensions.get('window')

export default class DefaultMainHeader extends Component {
    render() {
        return (
            <Text style={[styles.title, this.props.style]}
                ellipsizeMode='tail'
                numberOfLines={1} >{this.props.title}</Text>
        )
    }
}

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        title: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeXXL,
            color: CommonStyle.navigatorSpecial.navBarSubtitleColor,
            width: width * 0.7
        }
    })

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
