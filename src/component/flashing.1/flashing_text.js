import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class FlashingText extends Component {
    render() {
        if (this.props.value === null || this.props.value === undefined || this.props.value === '--') {
            return (<View style={this.props.wrapperStyle}>
                <Text
                    testID={this.props.testID}
                    style={[this.props.textStyle]}
                >
                    {`--`}
                </Text>
            </View>
            )
        } else {
            return (
                <View style={this.props.wrapperStyle}>
                    <Text
                        testID={this.props.testID}
                        style={[this.props.textStyle]}
                    >
                        {this.props.value}
                    </Text>
                </View>
            )
        }
    }
}
