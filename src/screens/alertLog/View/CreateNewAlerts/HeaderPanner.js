import React from 'react'
import { StyleSheet, Text, View, Platform, Image } from 'react-native'
import { useSelector } from 'react-redux';

import Ionicons from 'react-native-vector-icons/Ionicons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import Icon from '~/component/svg_icon/SvgIcon.js';
import * as Controller from '~/memory/controller';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import Shadow from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'

import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux'
import { calculateLineHeight } from '~/util'

const CloseIcon = (props) => (
    <TouchableOpacityOpt
        onPress={props.onPress}
        style={{
            // height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 16
        }}
    >
        <CommonStyle.icons.closeIcon
            color={CommonStyle.fontWhite}
            style={{ textAlign: 'center' }}
            size={20}
        />
    </TouchableOpacityOpt>
);
const RefreshIcon = (props) => (
    <TouchableOpacityOpt
        onPress={props.onPress}
        style={{
            paddingHorizontal: 16,
            // height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 50
        }}
    >
        <CommonStyle.icons.refreshed
            name='md-refresh'
            color={CommonStyle.fontWhite}
            style={{ textAlign: 'center' }}
            size={22.5}
        />
    </TouchableOpacityOpt>
);

const Info = ({ onClose, title, onRefresh }) => {
    const [Shadow, onLayout] = useShadow()
    const { isLoadingErrorSystem } = useLoadingErrorSystem()
    return <View style={{ zIndex: 10 }}>
        <Shadow />
        <View
            onLayout={onLayout}
            style={[styles.content, {
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                borderBottomWidth: 0,
                borderColor: 'transparent'
            }]}>
            <View style={styles.subContent}>
                <RefreshIcon onPress={onRefresh} />
                <View style={{
                    flex: 1,
                    alignItems: 'center'
                }}>
                    <TextLoading
                        isLoading={isLoadingErrorSystem}
                        numberOfLines={1}
                        style={[
                            CommonStyle.titlePanel,
                            {
                                textAlign: 'center',
                                opacity: title ? 1 : 0
                            },
                            Platform.OS === 'ios' ? {} : { lineHeight: calculateLineHeight(CommonStyle.fontSizeM) } // Anh thanh bao khong doi fontSize
                        ]}
                    >
                        {title || 0}
                    </TextLoading>
                </View>

                <CloseIcon onPress={onClose} />
            </View>

        </View>
    </View>
}
const HeaderPanner = ({ onLayout = () => { }, title, onClose, onRefresh }) => {
    return (
        <View onLayout={onLayout} style={{
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            borderBottomWidth: 0,
            borderColor: 'transparent'
        }}>
            <Shadow heightShadow={40} />
            <Info
                title={title}
                onClose={onClose}
                onRefresh={onRefresh}
            />
        </View>
    )
}

export default HeaderPanner

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        seperate: {
            width: '100%',
            height: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
        },
        seperateWrapper: {
            width: '100%',
            backgroundColor: CommonStyle.backgroundColor
        },
        dragIcon: {
            alignSelf: 'center',
            marginBottom: 4,
            marginTop: 0
        },
        subContent: {
            flexDirection: 'row',
            // flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        content: {
            zIndex: 9,
            backgroundColor: CommonStyle.backgroundColor,
            // flex: 1,
            paddingTop: 8,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        iconContent: {
            right: 16,
            height: '100%',
            position: 'absolute',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center'
        },
        bg: {
            height: '100%',
            width: '100%',
            position: 'absolute',
            backgroundColor: CommonStyle.backgroundColor
        }
    });
    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
