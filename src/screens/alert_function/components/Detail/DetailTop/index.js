import React, { Component, PureComponent } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'

import CommonStyle, { register } from '~/theme/theme_controller'
import * as Controller from '~/memory/controller'

import CustomButton from '~/component/custom_button/custom_button_watchlist'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import Icon from 'react-native-vector-icons/Ionicons';
import ENUM from '~/enum'
export default class DetailTop extends PureComponent {
    renderTitle = () => {
        const { title } = this.props
        return (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
                <Text style={CommonStyle.titlePanel}>
                    {title}
                </Text>
            </View>
        )
    }
    renderIcon = () => {
        const { onC2R, onClose } = this.props
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center'
            }}>
                {this.renderC2RIcon()}
                {this.renderCloseIcon()}
            </View>
        )
    }
    renderC2RIcon() {
        const isStreaming = Controller.isPriceStreaming()
        const { onC2R } = this.props
        return isStreaming
            ? <View />
            : <View
                style={[{ marginRight: 16, alignItems: 'flex-end' }]}
            >
                {
                    this.props.isLoadingPrice
                        ? <CustomButton
                            style={{ alignItems: 'center', justifyContent: 'center' }}
                            iconStyle={{ height: 32, width: 32, right: -14 }} />
                        : <TouchableOpacityOpt
                            style={{}}
                            testID="OrderSearchC2R"
                            onPress={onC2R}
                            timeDelay={ENUM.TIME_DELAY}
                            hitSlop={{
                                top: 16,
                                left: 16,
                                bottom: 16,
                                right: 16
                            }}
                        >
                            <Icon
                                color={CommonStyle.fontWhite}
                                size={20}
                                name={'ios-refresh'} />
                        </TouchableOpacityOpt>
                }
            </View>
    }
    renderCloseIcon() {
        const { onClose } = this.props
        return <TouchableOpacityOpt
            onPress={onClose}
            timeDelay={ENUM.TIME_DELAY}
            style={{
                height: 18,
                // paddingTop: 8,
                marginLeft: 8
            }}
            hitSlop={{
                top: 16,
                left: 16,
                bottom: 16,
                right: 16
            }}
        >
            <View style={{
                borderRadius: 48,
                width: 18,
                height: 18,
                backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor3,
                alignContent: 'center',
                justifyContent: 'center'
            }}>
                <Icon
                    name='md-close' color={CommonStyle.backgroundColor}
                    style={{ textAlign: 'center', lineHeight: 18 }}
                    size={10}
                />
            </View>
        </TouchableOpacityOpt>
    }
    renderIconDrag = () => {
        return <View style={{ flex: 1 }} >
            <View style={[CommonStyle.dragIcons, { marginTop: 4 }]} />
        </View>
    }
    render() {
        return (
            <View style={[{ alignItems: 'center', paddingHorizontal: 16, width: '100%' }, this.props.style]}>
                {this.renderIconDrag()}

                <View style={{ width: '100%' }}>
                    {this.renderTitle()}
                    <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'flex-end' }]}>
                        {this.renderIcon()}
                    </View>
                </View>
            </View>
        );
    }
}
