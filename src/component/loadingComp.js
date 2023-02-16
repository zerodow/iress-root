import React, { PureComponent } from 'react';
import { View } from 'react-native';

import ProgressBar from '../modules/_global/ProgressBar';
import CommonStyle, { register } from '~/theme/theme_controller'

export default class Loading extends PureComponent {
	renderLoading() {
		if (!this.props.isLoading) return null;
		return (
			<View
				style={{
					height: '100%',
					width: '100%',
					backgroundColor: CommonStyle.backgroundColor,
					position: 'absolute',
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<ProgressBar />
			</View>
		);
	}
	render() {
		return (
			<View>
				{this.props.children}
				{this.renderLoading()}
			</View>
		);
	}
}
