import React, { Component } from 'react';
import { Image } from 'react-native';
import * as flags from './index.js';

export default class Flag extends Component {
	render() {
		const code = this.props.code;
		const size =
			this.props.size && this.props.size > 0
				? this.props.size > 64
					? 64
					: this.props.size
				: 18;
		const type = this.props.type || 'flat';
		const style = this.props.style || {};
		const sizeImage = 64; // default
		const flag = flags[type][`icons${sizeImage}`][code];
		const unknownFlag = flags[type][`icons${sizeImage}`]['unknown'];
		if (!this.props.code) return null;
		return (
			<Image
				source={flag || unknownFlag}
				style={[{ width: size, height: size }, style]}
			/>
		);
	}
}
