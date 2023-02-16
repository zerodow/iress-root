import React, { Component } from 'react';
import { requireNativeComponent } from 'react-native';

export default class SmartInputAndroid extends Component {
    onUpdate = event => {
        this.props.onChange && this.props.onChange(event.nativeEvent.value)
    }

    render() {
        return (
            <SmartInputNative
                style={this.props.style}
                editable={this.props.editable}
                value={this.props.value}
                pattern={this.props.pattern}
                onUpdate={this.onUpdate}
                keyboard={this.props.keyboard}
            />
        )
    }
}

const SmartInputNative = requireNativeComponent('SmartInputAndroid', SmartInputAndroid)
