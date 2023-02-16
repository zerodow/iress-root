import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import Styles from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/RowNews/styles.js'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import ENUM from '~/enum';
export default React.memo((props) => {
    return (
        <View
            timeDelay={ENUM.TIME_DELAY}
        >
            <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: CommonStyle.backgroundColor }}>
                <ViewLoading isLoading={true}>
                    <View style={Styles.viewRow}>
                        <Text style={Styles.labelSymbol}>
                            ANZ.ASX
                        </Text>
                    </View>
                </ViewLoading>
                <View style={{ height: 4 }} />
                <ViewLoading isLoading={true}>
                    <Text style={Styles.labelCompanyName}>BHP GROUP PRO</Text>
                </ViewLoading>
                <View style={{ height: 4 }} />
                <ViewLoading isLoading={true}>
                    <Text numberOfLines={1} style={Styles.labelTitleNews}>NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update</Text>
                </ViewLoading>
                <View style={{ height: 4 }} />
                <ViewLoading isLoading={true}>
                    <Text style={Styles.labelTimeAndVendor}>10:27 PM, 01/04/22020</Text>
                </ViewLoading>
            </View>
        </View>
    )
}, () => true)
