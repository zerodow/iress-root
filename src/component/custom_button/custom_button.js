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
            Platform.OS === 'ios' ? <View>
                <ActivityIndicator style={{ width: 20, height: 20 }} color={CommonStyle.btnColor} />
            </View> : <TouchableOpacity
                style={{
                    overflow: 'hidden',
                    width: 34,
                    height: 34,
                    paddingVertical: 15
                }
                }
                disabled={true}
            >
                    <View>
                        <ActivityIndicator style={{ width: 20, height: 20 }} color={CommonStyle.btnColor} />
                    </View>
                </TouchableOpacity>
        );
    }
}
