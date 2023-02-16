import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect, useMemo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import VendorImage from './VendorImage'
// Model
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js'
export default ({ vendorCode }) => {
    const vendorName = useMemo(() => {
        const dataVendor = HeaderModel.getDataVendor()
        return dataVendor && dataVendor[vendorCode] && dataVendor[vendorCode]['vendor_description']
    }, [vendorCode])
    return (
        <VendorImage vendorName={vendorName} vendorCode={vendorCode} />
    )
}
