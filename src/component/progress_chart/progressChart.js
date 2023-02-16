import React, { useMemo, useCallback } from 'react'
import { View, Text } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Animated, { Easing } from 'react-native-reanimated'

const {
    Value
} = Animated

const ProgressChart = props => {
    const {
        progressStyle, textStyle, wrapperStyle, noteTextStyle,
        text, color, percent, showViewFakeAbsolute, noteText,
        filledPriceStyle
    } = props
    /* #region useMemo */
    const defaultProgressStyle = useMemo(() => {
        return {
            borderTopRightRadius: percent === 100 ? 8 : 0,
            borderTopLeftRadius: 8,
            borderBottomRightRadius: percent === 100 ? 8 : 0,
            borderBottomLeftRadius: 8,
            paddingVertical: 2,
            minHeight: 22,
            width: percent !== null & percent !== undefined
                ? `${percent}%`
                : '100%',
            backgroundColor: color || CommonStyle.fontBgChart
        }
    }, [percent, color])
    const heightViewFake = useMemo(() => {
        return new Value(0)
    }, [])
    /* #endregion */
    /* #region Default style */
    const defaultWrapperStyle = {
        position: 'absolute',
        left: 0,
        right: 0
    }
    const defaultTextStyle = {
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.font11,
        color: CommonStyle.fontBlack,
        paddingLeft: 16
    }
    const defaultNoteTextStyle = {
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.font11,
        color: CommonStyle.fontColor
    }
    const defaultFilledPriceStyle = {
        justifyContent: 'center',
        position: 'absolute',
        minHeight: 22,
        left: 0
    }
    /* #endregion */
    /* #region useCallback */
    const onLayout = useCallback((event) => {
        const { layout } = event.nativeEvent
        const { height } = layout
        heightViewFake.setValue(height)
    }, [])
    const renderFilledPrice = useCallback(() => {
        return text
            ? <View style={[defaultFilledPriceStyle, filledPriceStyle]}>
                <Text style={[
                    defaultTextStyle, textStyle
                ]}>
                    {text}
                </Text>
            </View>
            : null
    }, [text])
    const renderViewFakeAbsolute = useCallback(() => {
        return showViewFakeAbsolute
            ? <Animated.View style={{ height: heightViewFake }} />
            : null
    }, [showViewFakeAbsolute])
    const renderProgressBar = useCallback(() => {
        return <View
            onLayout={onLayout}
            style={[defaultWrapperStyle, wrapperStyle]}>
            <View
                style={[
                    defaultProgressStyle, progressStyle
                ]}>
            </View>
            <View
                style={[
                    defaultProgressStyle,
                    { backgroundColor: 'transparent', alignItems: 'flex-end', paddingTop: 2, paddingBottom: 6 },
                    progressStyle
                ]}>
                {
                    noteText
                        ? <Text style={[
                            defaultNoteTextStyle, noteTextStyle
                        ]}>
                            {noteText}
                        </Text>
                        : null
                }
            </View>
        </View>
    }, [percent, noteText, color])
    /* #endregion */
    return <React.Fragment>
        {renderProgressBar()}
        {renderViewFakeAbsolute()}
        {renderFilledPrice()}
    </React.Fragment>
}

export default ProgressChart
