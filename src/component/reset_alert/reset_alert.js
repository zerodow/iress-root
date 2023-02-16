import React, { Component } from 'react';
import { View, Text, TouchableOpacity, PixelRatio } from 'react-native'
import { BlurView } from 'react-native-blur'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language/';

export default class ResetAlert extends Component {
    renderButton() {
        return (
            <View style={{
                borderTopWidth: 0.5,
                borderTopColor: 'rgba(0, 0, 0, 0.2)',
                flexDirection: 'row',
                height: 48
            }}>
                <TouchableOpacity onPress={this.props.cancelFn} style={{ flex: 49 }}>
                    <View style={{
                        flex: 1,
                        padding: 15,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontApple, fontWeight: '300' }]}>
                            {I18n.t('cancel')}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={{ height: '100%', flex: 2, borderRightWidth: 0.5, borderRightColor: 'rgba(0,0,0,0.2)', zIndex: 99999 }}></View>
                <TouchableOpacity onPress={this.props.doneFn} style={{ flex: 49 }}>
                    <View style={{
                        flex: 1,
                        padding: 15,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {
                            <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontApple }]}>
                                {I18n.t('ok')}
                            </Text>
                        }
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    renderIos() {
        return (
            <BlurView blurType="xlight" style={{ borderRadius: 12 }}>
                <View style={{ backgroundColor: 'transparent' }}>
                    <View style={{ marginHorizontal: 20, marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={[CommonStyle.textTitleDialog, { marginBottom: 8, color: CommonStyle.fontBlack }]}>{I18n.t('notice')}</Text>
                        <Text style={[CommonStyle.textDescDialog, { textAlign: 'center', justifyContent: 'center', alignItems: 'center', color: CommonStyle.fontBlack }]}>
                            {this.props.msg}
                        </Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#0000001e' }}></View>

                    {
                        this.renderButton()
                    }
                </View>
            </BlurView>
        )
    }

    renderAndroid() {
        return (
            <View style={{ backgroundColor: 'white', borderRadius: 12 }}>
                <View style={{ backgroundColor: 'transparent' }}>
                    <View style={{ marginHorizontal: 20, marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={[CommonStyle.textTitleDialog, { marginBottom: 8, color: CommonStyle.fontBlack }]}>{I18n.t('notice')}</Text>
                        <Text style={[CommonStyle.textDescDialog, { textAlign: 'center', justifyContent: 'center', alignItems: 'center', color: CommonStyle.fontBlack }]}>
                            {this.props.msg}
                        </Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#0000001e' }}></View>
                    {
                        this.renderButton()
                    }
                </View>
            </View>
        )
    }

    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <View style={{ marginHorizontal: 32 }}>
                    {
                        PureFunc.isIOS()
                            ? this.renderIos()
                            : this.renderAndroid()
                    }
                </View>
            </View>
        )
    }
}
