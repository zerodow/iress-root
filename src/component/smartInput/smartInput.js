import React, { Component } from 'react';
import * as Util from '../../util'
import SmartInputIOS from './smartInputIOS'
import SmartInputAndroid from './smartInputAndroid'

export default class SmartInput extends Component {
    render() {
        const CurrentInput = Util.isIOS() ? SmartInputIOS : SmartInputAndroid
        return (
            <CurrentInput
                editable={this.props.editable !== false}
                value={this.props.value}
                pattern={this.props.pattern}
                onChange={this.props.onChange}
                style={this.props.style}
                keyboard={this.props.keyboard}
            />
        )
    }
}
