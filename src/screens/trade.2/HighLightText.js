import { Text } from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import React, { Component } from 'react'

export default class HighLightText extends Component {
    render() {
        let symbol = null;
        if (this.props.addSymbol) {
            symbol = '+';
        } else {
            symbol = '';
        }
        if (this.props.percent) {
            percent = '%';
        } else {
            percent = '';
        }
        if (this.props.value === null || this.props.value === undefined || this.props.value === '--') {
            return (<Text testID={this.props.testID} style={[{ color: CommonStyle.fontColor, opacity: CommonStyle.opacity1 }, this.props.style]}>--</Text>)
        }
        if (this.props.value === '-- (--)') {
            return (<Text testID={this.props.testID} style={[{ color: CommonStyle.fontColor, opacity: CommonStyle.opacity1 }, this.props.style]}>-- (--)</Text>)
        }
        if (parseFloat(this.props.base) < 0) {
            return (<Text testID={this.props.testID} style={[{ color: CommonStyle.fontRed }, this.props.style]}>{this.props.value}{percent}</Text>);
        } else if (parseFloat(this.props.base) > 0) {
            return (<Text testID={this.props.testID} style={[{ color: CommonStyle.fontGreen }, this.props.style]}>{symbol}{`${this.props.value}`}{percent}</Text>);
        } else {
            return (<Text testID={this.props.testID} style={[{ color: CommonStyle.fontColor, opacity: CommonStyle.opacity1 }, this.props.style]}>{this.props.value}{percent}</Text>);
        }
    }
}
