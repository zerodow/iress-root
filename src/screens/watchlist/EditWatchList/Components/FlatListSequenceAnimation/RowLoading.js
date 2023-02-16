import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import ENUM from '~/enum';
export function ViewLoading({ children }) {
    return (
        <View style={{
            alignSelf: 'baseline',
            backgroundColor: '#434651',
            borderRadius: 4
        }}>
            {children}
        </View>
    )
}
export default React.memo(({ index }) => {
    return (
        <View
            style={[{ marginTop: index === 0 ? 0 : 8, flexDirection: 'column' }]}
        >
            <View style={{
                height: 44,
                backgroundColor: 'red',
                marginTop: 16
            }}>

            </View>
        </View>
    )
}, () => true)
