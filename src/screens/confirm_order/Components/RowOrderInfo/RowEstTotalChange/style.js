import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

    orderStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    txtOrderStyleTitle: {
        color: CommonStyle.fontColor,
        fontSize: CommonStyle.font13,
        fontFamily: CommonStyle.fontPoppinsRegular,
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 8
    },
    txtOrderStyle: {
        color: CommonStyle.fontNearLight6,
        fontSize: CommonStyle.font11,
        fontFamily: CommonStyle.fontPoppinsRegular,
        marginLeft: 16,
        marginRight: 8,
        marginBottom: 8,
        textAlign: 'center'
    },
    styleFees: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    txtStyleFees: {
        color: CommonStyle.fontNearLight6,
        fontSize: CommonStyle.fontTiny,
        fontFamily: CommonStyle.fontPoppinsRegular,
        marginLeft: 32,
        marginRight: 8,
        marginBottom: 8
    }
})

PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
