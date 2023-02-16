import React from 'react';
import { StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        container: {
            flex: 1
        },
        btnUpdate: {
            marginHorizontal: 16,
            height: 36,
            backgroundColor: '#10a8b2',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 3
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;
