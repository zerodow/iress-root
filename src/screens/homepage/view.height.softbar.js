import React from 'react'
import { View, Text, Platform } from 'react-native'

import ExtraDimensions from 'react-native-extra-dimensions-android';

export default () => {
    const heightSoftBar =
        Platform.OS === 'android'
            ? ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT') || 0
            : 0; /** fix loi che course of sale khi co soft bar */
    return <View style={{ height: heightSoftBar }} />
}
