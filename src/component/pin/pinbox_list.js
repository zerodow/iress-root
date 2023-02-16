import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import PinBox from './pinbox';
import { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export default class PinBoxList extends Component {
	renderPills() {
		let pills = [];

		for (var i = 0; i < this.props.pinLength; i++) {
			pills.push(this.renderPill(i + 1));
		}

		return pills;
	}

	renderPill(index) {
		return (
			<PinBox
				pinLength={this.props.pinLength}
				pinJustEnter={this.props.pinJustEnter}
				position={this.props.position}
				pinValue={this.props.pinValue}
				arrPin={this.props.arrPin}
				key={index}
				index={index}
				hasValue={this.props.pinValueLength && this.props.pinValueLength >= index}
				{...this.props}
			/>
		);
	}

	render() {
		return (
			<TouchableOpacity
				activeOpacity={1}
				style={[styles.pinBoxList]}>
				{this.renderPills()}
			</TouchableOpacity>
		);
	}
}

const styles = {};

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		pinBoxList: {
			flex: -1,
			flexDirection: 'row',
			justifyContent: 'space-between'
			// marginTop: 10,
			// paddingBottom: 1
		}
	});

	PureFunc.assignKeepRef(styles, newStyle)
}

getNewestStyle();
register(getNewestStyle);
