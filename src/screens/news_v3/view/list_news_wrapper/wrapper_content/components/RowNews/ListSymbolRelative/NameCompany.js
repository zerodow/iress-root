import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect, useMemo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import DotGray from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/RowNews/DotGray.js'
import * as Business from '~/business.js'

export default NameCompany = ({ symbol, isLoading, exchange, index, listSymbolLimit }) => {
    const companyName = useMemo(() => {
        return Business.getCompanyName({ symbol, exchange })
    }, [symbol, isLoading])
    if (index === 0) {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text numberOfLines={1} style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    fontSize: CommonStyle.font10,
                    color: CommonStyle.fontNearLight6
                }}>
                    {
                        companyName || '--'
                    }
                </Text>
            </View>
        )
    } else {
        return (
            <React.Fragment>
                <DotGray />
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text numberOfLines={1} style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font10,
                        color: CommonStyle.fontNearLight6
                    }}>
                        {
                            companyName || '--'
                        }
                    </Text>
                </View>
            </React.Fragment>

        )
    }
    return (
        [
            index !== 0 && companyName && companyName !== '' ? <DotGray /> : null,
            <Text numberOfLines={1} style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.font10,
                color: CommonStyle.fontNearLight6,
                minWidth: 18
            }}>
                {
                    companyName || ''
                }
            </Text>
        ]
    )
}
