import React, { Component } from 'react';
import {
    ActivityIndicator,
    TouchableOpacity,
    Text,
    Platform
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import { View } from 'react-native-animatable';

export default class CustomButton extends Component {
    render() {
        return (
            Platform.OS === 'ios'
                ? <View >
                    <ActivityIndicator style={[{ width: 26, height: 26, right: -4 }, this.props.style]} color={CommonStyle.fontWhite} />
                </View>
                : <TouchableOpacity
                    style={[
                        {
                            overflow: 'hidden',
                            width: 48,
                            height: 40,
                            paddingVertical: 12
                        },
                        this.props.style
                    ]}
                    disabled={true}
                >
                    <View>
                        <ActivityIndicator style={[{ width: 26, height: 26, right: -10 }, this.props.iconStyle]} color={CommonStyle.fontWhite} />
                    </View>
                </TouchableOpacity >
        );
    }
}
