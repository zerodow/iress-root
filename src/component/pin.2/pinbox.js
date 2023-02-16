import React, { Component } from 'react';
import { Text, TextInput, View, StyleSheet, Platform, PixelRatio } from 'react-native';
import PropTypes from 'prop-types';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export default class PinBox extends Component {
	// static propTypes = {
	//   hasValue: PropTypes.boolean
	// };
	constructor(props) {
		super(props);
		this.state = {
			pinCode: []
		}
	}

	onPressText() {
		console.log('Focus pin input')
		this.props.onFocusPinWhenHideKeyBoard();
	}
	renderText() {
		if (!this.props.hasValue) {
			return <Text style={[{ fontSize: CommonStyle.font15, opacity: 0.54 }, this.props.pinTextStyle]}>✽</Text>;
		} else {
			let pinCode = this.props.arrPin[this.props.index - 1]
			return <Text style={[{ fontSize: Platform.OS === 'ios' ? CommonStyle.fontSizeXL : CommonStyle.fontSizeL, fontWeight: '700' }, this.props.pinTextStyle]}>{pinCode}</Text>;
		}
	}
	render() {
		let { pinLength } = this.props
		let styleMiddlePin = {};
		if (pinLength % 2 === 0 && pinLength <= 8) {
			let indexMarginRight = (pinLength / 2);
			let indexMarginLeft = (pinLength / 2) + 1
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
			<View style={[styles.pinBox, styleMiddlePin]}>
				{this.renderText()}
			</View>
		);
	}
}

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		pinBox: {
			alignItems: 'center',
			width: 22,
			marginRight: 6,
			justifyContent: 'center'
		}
	});

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
