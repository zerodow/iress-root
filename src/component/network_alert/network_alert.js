import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { VibrancyView, BlurView } from 'react-native-blur'

export default class NetworkAlert extends Component {
    render() {
        return (
            <View style={{
                backgroundColor: 'transparent',
                width: '100%',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {
                    Platform.OS === 'ios'
                    ? <BlurView blurType="xlight" style={{ borderRadius: 12 }}>
                        <Text style={[CommonStyle.fontLargeNormal, { color: '#030303', textAlign: 'center', paddingHorizontal: 32, marginTop: 16 }]}>{this.props.alertContent}</Text>
                        <TouchableOpacity style={{ borderTopWidth: 1, borderTopColor: '#0000001e', height: 32, justifyContent: 'center', alignItems: 'center', marginTop: 8 }}
                            onPress={this.props.onPress}>
                            <Text style={{ color: '#007aff', textAlign: 'center' }}>{this.props.btnText}</Text>
                        </TouchableOpacity>
                    </BlurView>
                    : <View style={{ backgroundColor: '#f1eff5', borderRadius: 12, marginBottom: 8 }}>
                        <Text style={[CommonStyle.fontLargeNormal, { color: '#030303', textAlign: 'center', paddingHorizontal: 32, marginTop: 16 }]}>{this.props.alertContent}</Text>
                        <TouchableOpacity style={{ borderTopWidth: 1, borderTopColor: '#0000001e', height: 32, justifyContent: 'center', alignItems: 'center', marginTop: 8 }}
                            onPress={this.props.onPress}>
                            <Text style={{ color: '#007aff', textAlign: 'center' }}>{this.props.btnText}</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        );
    }
}
