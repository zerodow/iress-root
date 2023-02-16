import React, { Component } from 'react';
import { Platform, Text, View } from 'react-native';
import CommonStyle from '~/theme/theme_controller'

export default class PinBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pinCode: []
		}
	}

	renderText() {
		if (!this.props.hasValue) {
			return (
				<Text style={[CommonStyle.pinVersion2.pinBoxText, {
					top: 5
				}]}>
					_
				</Text>
			);
		} else {
			let pinCode = this.props.arrPin[this.props.index - 1];
			if (pinCode === '*') {
				return (
					<Text style={[CommonStyle.pinVersion2.pinBoxText, {
						fontSize: Platform.OS === 'ios' ? CommonStyle.fontSizeXL : CommonStyle.fontSizeL,
						fontWeight: '500',
						top: Platform.OS === 'ios' ? 5 : 2
					}]}>
						{pinCode}
					</Text>
				);
			} else {
				return (
					<Text style={[CommonStyle.pinVersion2.pinBoxText, {
						fontSize: Platform.OS === 'ios' ? CommonStyle.fontSizeXL : CommonStyle.fontSizeL,
						fontWeight: '500'
					}]}>
						{pinCode}
					</Text>
				);
			}
		}
	}

	render() {
		let { pinLength } = this.props;
		let styleMiddlePin = {};
		if (pinLength % 2 === 0 && pinLength <= 8) {
			let indexMarginRight = (pinLength / 2);
			let indexMarginLeft = (pinLength / 2) + 1;
			if (this.props.index === indexMarginRight) {
				styleMiddlePin = {
					marginRight: 10
				}
			} else if (this.props.index === indexMarginLeft) {
				styleMiddlePin = {
					marginLeft: 4
				}
			}
		}
		return (
			<View style={[CommonStyle.pinVersion2.pinBox, styleMiddlePin]}>
				{this.renderText()}
			</View>
		);
	}
}
