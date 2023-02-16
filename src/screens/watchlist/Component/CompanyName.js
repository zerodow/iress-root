import React, { Component } from 'react';
import { Text, View, Platform } from 'react-native';

import CommonStyle from '~/theme/theme_controller';

export default class CompanyName extends Component {
    render() {
        if (this.props.isLoading) return null;
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', overflow: 'visible' }}>
                <Text
                    numberOfLines={1}
                    style={[{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font10,
                        color: CommonStyle.fontWhite,
                        opacity: 0.5
                    }, Platform.OS === 'android' ? {
                        lineHeight: CommonStyle.font10 + 5
                    } : {}]}
                >
                    {this.props.value}
                </Text>
                <Text
                    style={{
                        opacity: 0
                    }}
                >
                    0
                </Text>
            </View>
        );
    }
}
