import React, { useMemo } from 'react'
import {
    View, Text, Dimensions, Platform
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Animated from 'react-native-reanimated'

const { width: DEVICE_WIDTH } = Dimensions.get('window')
const { interpolate } = Animated
const Bar = ({ width, style, children, animated }) => {
    const BarComp = animated ? Animated.View : View
    return <BarComp style={[{
        width
    }, style]}>
        {children}
    </BarComp>
}

const ParalleloGram = ({ property }) => {
    const { width, height, color } = property
    return <View style={{
        width,
        height,
        backgroundColor: color
    }}>

    </View>
}

const useStyleByPlatform = ({ height, totalWidth, translateX }) => {
    if (Platform.OS === 'ios') {
        return {
            position: 'absolute',
            flexDirection: 'row',
            height,
            top: 0,
            width: totalWidth,
            right: -totalWidth / 2,
            transform: [
                { skewX: '-20deg' },
                { translateX }
            ]
        }
    }
    return {
        position: 'absolute',
        flexDirection: 'row',
        height: 2 * height,
        top: -height / 4,
        width: totalWidth,
        right: -totalWidth / 2,
        overflow: 'hidden',
        transform: [
            { rotate: '20deg' },
            { translateX }
        ]
    }
}

const SplitPoint = ({ maxWidth, widthAnimated, color, height }) => {
    const leftProperty = {
        width: 8,
        height: '100%',
        color
    }
    const midProperty = {
        width: 6,
        height: '100%',
        color: CommonStyle.color.dark
    }
    const rightProperty = {
        width: 8,
        height: '100%',
        color: CommonStyle.color.dusk_tabbar
    }
    const totalWidth = leftProperty.width + midProperty.width + rightProperty.width
    const translateX = useMemo(() => {
        return interpolate(widthAnimated, {
            inputRange: [0, 1, maxWidth - 1, maxWidth],
            outputRange: [-totalWidth, 0, 0, totalWidth]
        })
    }, [])
    const style = useStyleByPlatform({ height, totalWidth, translateX })
    return <Animated.View style={style}>
        <ParalleloGram property={leftProperty} />
        <ParalleloGram property={midProperty} />
        <ParalleloGram property={rightProperty} />
    </Animated.View>
}

const ProgressChart = ({
    maxWidth,
    widthAnimated,
    height,
    inProgressColor,
    outProgressColor
}) => {
    return <View style={[{
        overflow: 'hidden',
        width: maxWidth
    }]}>
        <Bar
            width={maxWidth}
            style={{
                height,
                backgroundColor: outProgressColor,
                borderRadius: 8
            }} />
        <Bar
            width={widthAnimated}
            animated
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height,
                borderRadius: 8,
                backgroundColor: inProgressColor
            }}>
            <SplitPoint
                maxWidth={maxWidth}
                widthAnimated={widthAnimated}
                height={height}
                color={inProgressColor} />
        </Bar>
    </View>
}

export default ProgressChart
