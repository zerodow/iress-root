import React, { Component } from 'react';
import { View, Text } from 'react-native';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export class Header extends Component {
	render() {
		const { title } = this.props;
		return (
			<View
				style={{
					backgroundColor: CommonStyle.colorHeaderAll,
					paddingLeft: 16,
					height: 48,
					justifyContent: 'center'
				}}
			>
				<Text style={CommonStyle.textMain}>{title.toUpperCase()}</Text>
			</View>
		);
	}
}
export default Header;
