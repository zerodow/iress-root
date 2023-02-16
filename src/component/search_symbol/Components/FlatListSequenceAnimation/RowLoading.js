import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import { styles, BoxClass } from '~/component/search_symbol/Views/Content.js'
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
            style={[styles.boxRow, { marginTop: index === 0 ? 0 : 8, flexDirection: 'column' }]}
        >
            <ViewLoading>
                <Text style={[styles.textSymbol, { opacity: 0 }]}>THC.ASX</Text>
            </ViewLoading>
            <View style={{ height: 4 }} />
            <ViewLoading>
                <Text style={[styles.textCompany, { opacity: 0 }]}>THC Global Group</Text>
            </ViewLoading>
            <View style={{ height: 4 }} />
            {/* <ViewLoading>
                <View style={{ opacity: 0 }}>
                    <BoxClass className={'equity'} />
                </View>
            </ViewLoading> */}
        </View>
    )
}, () => true)
