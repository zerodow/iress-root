import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { connect } from 'react-redux';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language';
import { dataStorage } from '../../storage';
const { height, width } = Dimensions.get('window');

class NetworkWarning extends Component {
	render() {
		if (this.props.isConnected) return null;

		return (
			<View
				style={{
					width: width,
					backgroundColor: CommonStyle.fontShadowRed,
					justifyContent: 'center',
					alignItems: 'center',
					paddingVertical: 4
				}}
			>
				<Text style={[
					CommonStyle.textSubLightWhite,
					{
						fontFamily: CommonStyle.fontPoppinsRegular,
						color: CommonStyle.fontDark
					}
				]}>{`${I18n.t(
					'connecting'
				)}...`}</Text>
			</View>
		);
	}
}

export default connect(state => ({
	isConnected: state.app.isConnected
}))(NetworkWarning);
