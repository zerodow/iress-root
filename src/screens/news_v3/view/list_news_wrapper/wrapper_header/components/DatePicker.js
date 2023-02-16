import React, { useState, useCallback, useContext, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
// Langue
import I18n from '~/modules/language/';
// Component
import CustomDate from '~/component/customDate'
// Model
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js'
// Context
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import { useShadow } from '~/component/shadow/SvgShadow'
const DatePickerMemo = React.memo(({ search }) => {
    return <View style={{ flexDirection: 'row', width: '100%', height: '100%' }}>
        <View style={{ width: 32 }} />
        <CustomDate
            fromDate={HeaderModel.getFromGTD()}
            toDate={HeaderModel.getToGTD()}
            applyDate={search}
        />
    </View>
}, () => true)
export default DatePicker = React.memo(() => {
    const [Shadow, onLayout] = useShadow()
    const { search } = useContext(NewsWrapperContext)
    const cbSearch = useCallback((fromDate, toDate) => {
        HeaderModel.setFromGTD(fromDate)
        HeaderModel.setToGTD(toDate)
        search && search()
    }, [])
    return <View>
        <Shadow />
        <View
            onLayout={onLayout}
            style={{ width: '100%', paddingHorizontal: 8, alignItems: 'center' }}>
            <View
                style={{ height: 52, alignSelf: 'center', marginVertical: 8 }}>
                <DatePickerMemo search={cbSearch} />
            </View>
        </View>
    </View>
}, () => true)
