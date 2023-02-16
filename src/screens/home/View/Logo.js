import React from 'react'
import { View, Image } from 'react-native'
import logo from '~/img/background_mobile/logo_shadow.png';
import Animated, { Easing } from 'react-native-reanimated'
import CommonStyle from '~/theme/theme_controller'

const Logo = ({ translateY }) => {
    const opacity = Animated.interpolate(translateY, {
        inputRange: [-300, 0],
        outputRange: [0, 1]
    })
    return <Animated.View style={{
        opacity: opacity
    }}>
        <Image
            source={CommonStyle.images.logo}
            resizeMode={'contain'}
            style={{ marginTop: 59, height: 122, width: 156 }} />
    </Animated.View>
}

export default Logo
