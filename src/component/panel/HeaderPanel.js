import React, { useCallback, useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import PropTypes from 'prop-types';
import { CloseIcon, IconClickToRefresh, CloseIcon2 } from './Icon';
import * as Controller from '~/memory/controller';
import Shadow from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow'
import CommonStyle, { register } from '~/theme/theme_controller';
import OrderError from '~/component/Error/OrderError.js'
import TouchableWithoutFeedbackKeyBoard from '~/component/virtual_keyboard/TouchableDismissKeyboard.js';
import { ViewLoading } from '~/screens/watchlist/EditWatchList/Components/FlatListSequenceAnimation/RowLoading';
import { calculateLineHeight } from '~/util'
const Title = ({ title, onPressTitle, style }) => {
    if (onPressTitle) {
        return (
            <View
                // onPress={onPressTitle}
                style={[
                    {
                        flex: 1,
                        alignItems: 'center',
                        paddingHorizontal: 8
                    },
                    style
                ]}>
                <Text
                    numberOfLines={1}
                    style={[
                        {
                            fontSize: CommonStyle.fontSizeM,
                            color: CommonStyle.fontColor,
                            fontFamily: CommonStyle.fontPoppinsBold
                        },
                        Platform.OS === 'ios' ? {} : { lineHeight: calculateLineHeight(CommonStyle.fontSizeM) }
                    ]}>
                    {
                        title || '--'
                    }
                </Text>
            </View>

        )
    }
    return (
        <View style={[
            {
                flex: 1,
                borderRadius: 16,
                alignItems: 'center'
            }, style
        ]}>
            <Text
                numberOfLines={1}
                style={[
                    {
                        fontSize: CommonStyle.fontSizeM,
                        color: CommonStyle.fontColor,
                        fontFamily: CommonStyle.fontPoppinsBold
                    },
                    Platform.OS === 'ios' ? {} : { lineHeight: calculateLineHeight(CommonStyle.fontSizeM) }
                ]}>
                {
                    title
                }
            </Text>
        </View>
    )
}

const HeaderPanel = React.memo(({
    onClickToRefresh,
    title,
    onClose,
    isLoading,
    onPressTitle,
    channelMessage,
    titleStyle = {}
}) => {
    const [heightHeader, setHeightHeader] = useState(30)
    const [BottomShadow, onLayout] = useShadow()
    const callHeightHeader = useCallback((e) => {
        const { height } = e.nativeEvent.layout
        setHeightHeader(height)
        onLayout(e)
    }, [])

    return (
        <React.Fragment>
            <Shadow heightShadow={heightHeader} />
            <BottomShadow />
            <View
                onLayout={callHeightHeader}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    zIndex: 9,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: CommonStyle.backgroundColor,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22
                }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    {onClickToRefresh && <IconClickToRefresh isLoading={isLoading} onClickToRefresh={onClickToRefresh} />}
                    <Title style={titleStyle} onPressTitle={onPressTitle} title={title} />
                    {onClose && <CloseIcon onPress={onClose} />}
                </View>
            </View>
            <OrderError channel={channelMessage} />
        </React.Fragment>
    )
}, (pre, next) => pre.title === next.title)
HeaderPanel.propTypes = {
    onClickToRefresh: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired
}
export default HeaderPanel
