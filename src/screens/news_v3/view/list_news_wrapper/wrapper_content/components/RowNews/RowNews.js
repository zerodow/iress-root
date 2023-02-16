import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import ListSymbolRelative from './ListSymbolRelative/ListSymbolRelative'
import TitleNews from './TitleNews'
import TimeNews from './TimeNews'
import VendorName from './VendorName'
import DotGray from './DotGray'
import SwitchButton from '~/screens/alert_function/components/SwitchButton.js'
import ENUM from '~/enum';
export const HEIGHT_ROW = {
    height: Platform.OS === 'android' ? 101.7 : 103.7,
    heightWithoutSymbol: Platform.OS === 'android' ? 68.3 : 67.3
}
export default (props) => {
    const { handleShowDetailNews } = props
    const [itemObj, setItemObject] = useState(props.item)
    const { title, upGTDd, related_symbols: listSymbol, vendor_code: vendorCode, sign, timestamp, related_exchanges: relatedExchanges, tags } = props.item
    const listSymbolArray = listSymbol
    return (
        <TouchableOpacityOpt
            key={`TouchableOpacityOpt#RowNews#${props.index}`}
            onPress={
                () => {
                    Navigation.dismissModal({
                        animated: true,
                        animationType: 'none'
                    })
                    return handleShowDetailNews && handleShowDetailNews(itemObj)
                }
            }
            timeDelay={1500}
        >
            <View
                style={{
                    borderRadius: 8,
                    backgroundColor: CommonStyle.backgroundColor,
                    height: listSymbol && listSymbol.length === 0 ? HEIGHT_ROW.heightWithoutSymbol : HEIGHT_ROW.height,
                    justifyContent: 'space-around'
                }}>
                <View style={{
                    paddingHorizontal: 16
                }}>
                    <View style={{ height: 8 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <VendorName vendorCode={vendorCode} />
                        <TimeNews time={timestamp} />
                    </View>
                    <View style={{ height: 6 }} />
                    <TitleNews tags={tags} title={title} />
                    <View style={{ height: 6 }} />
                </View>
                {listSymbol && listSymbol.length === 0 ? null : <ListSymbolRelative listSymbol={listSymbolArray || []} />}
            </View>
        </TouchableOpacityOpt>
    )
}
