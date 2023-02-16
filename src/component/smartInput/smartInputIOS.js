import React, { Component } from 'react';
import { requireNativeComponent } from 'react-native'
const SmartInput = requireNativeComponent('SmartInput')

export default class SmartInputIOS extends Component {
    onUpdate = e => {
        this.props.onChange &&
            this.props.onChange(e.nativeEvent.value)
    }

    render() {
        return (
            <SmartInput
                style={this.props.style}
                bgColor={this.props.style.backgroundColor}
                color={this.props.style.color}
                fontSize={this.props.style.fontSize}
                value={this.props.value}
                pattern={this.props.pattern}
                onUpdate={this.onUpdate}
                editable={this.props.editable}
                keyboard={this.props.keyboard}
            />
        )
    }
}
