import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage, func } from '../../storage';
import I18n from '../../modules/language/';

export default class VerifyMailNoti extends Component {
	constructor(props) {
		super(props)
		this.verifyFn = this.verifyFn.bind(this)
	}
	verifyFn() {
		console.log('verify')
	}
	render() {
		return (
			// <View style={{
			// 	backgroundColor: '#0073ff',
			// 	justifyContent: 'center',
			// 	alignItems: 'center',
			// 	width: '100%',
			// 	height: 24
			// }}>
			// <TouchableOpacity onPress={this.props.verifyMailFn}>
			// 	<Text style={CommonStyle.textButtonColor}>{I18n.t('pleaseVerifyMail')}</Text>
			// 	</TouchableOpacity>
			// </View >
			<View></View>
		)
	}
}
