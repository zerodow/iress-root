import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import * as Business from '~/business.js'

export default ({ symbol, isLoading }) => {
    const isTradingHalt = useMemo(() => {
        return Business.getTradingHalt({ symbol })
    }, [symbol, isLoading])
    if (isTradingHalt) return <Ionicons name='md-alert' color='red' size={18} style={{ alignSelf: 'flex-start' }} />
    return null
}
