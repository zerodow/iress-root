import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform, PixelRatio } from 'react-native'
import AnimatedView, { ENUM as ENUM_TYPE_ANIMATION } from '~/component/animation_view/index'
import { BlurView } from 'react-native-blur'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language/';

export default class TokenWasChanged extends Component {
    renderContent() {
        return (
            <View >
                <View style={[{ backgroundColor: CommonStyle.backgroundColor }, { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, borderRadius: 8 }]}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={[CommonStyle.textTitleDialog, { marginBottom: 8 }]}>{I18n.t('notice')}</Text>
                        <Text style={[CommonStyle.textDescDialog, { textAlign: 'center', justifyContent: 'center', alignItems: 'center' }]}>
                            {this.props.msg}
                        </Text>
                    </View>

                    <View style={{ height: 1, backgroundColor: '#0000001e' }}></View>

                    <TouchableOpacity
                        onPress={this.props.doneFn}
                        style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: CommonStyle.fontBlue1, alignSelf: 'center', paddingHorizontal: 44, paddingVertical: 8, borderRadius: 22, marginTop: 32 }}>
                        <Text style={[CommonStyle.textTitleDialog, { color: CommonStyle.fontDark, textAlign: 'center' }]}>
                            {I18n.t('ok')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    render() {
        return (
            <AnimatedView
                ref={ref => this.refView = ref}
                style={{ flex: 1 }}
                type={ENUM_TYPE_ANIMATION.FADE_IN}
                styleContent={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CommonStyle.backgroundColorPopup }}>
                <View style={{ marginHorizontal: 22 }}>
                    {
                        this.renderContent()
                    }
                </View>
            </AnimatedView>
        )
    }
}
