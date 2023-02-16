import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import { styles, BoxClass } from '~/component/search_account/Views/Content.js'
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
            style={[styles.boxAccount, { marginTop: index === 0 ? 0 : 8, flexDirection: 'column' }]}
        >
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.textAccount}>Account  </Text>
                <ViewLoading>
                    <Text style={[styles.textId, { marginLeft: 12 }, { opacity: 0 }]}>123457</Text>
                </ViewLoading>
            </View>
            <View style={{ height: 4 }} />
            <ViewLoading>
                <Text style={[styles.textNameAccount, { opacity: 0 }]}>THC Global Group</Text>
            </ViewLoading>
        </View>
    )
}, () => true)
