import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
// Business
import * as Business from '~/business'

export default ({ time }) => {
    return (
        <TextLoading isLoading={false} style={[CommonStyle.textFloatingLabel3, { color: CommonStyle.fontNearLight7 }]}>
            {Business.getDisplayTimeNews(time)}
        </TextLoading>

    )
}
