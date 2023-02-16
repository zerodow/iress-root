import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import CustomIcon from '~/component/Icon'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';

import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'

export default React.memo(() => {
    return (
        <View style={{ width: 4, height: 4, borderRadius: 100, backgroundColor: CommonStyle.fontNearLight7, alignSelf: 'center', marginHorizontal: 4 }} />

    )
}, (preProps, nextProps) => true)
