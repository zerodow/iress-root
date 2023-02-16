import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './style/home_page';
export default class TextInputHomePage extends Component {
	showPassword() {
		this.props.showPassword(this.refTextInput, this.props.inputType)
	}
	render() {
		const {
			rightIcon,
			dialogInputClone
		} = styles;
		return (
			<View style={{ flexDirection: 'row', height: this.props.inputType ? 48 : 24 }}>
				<TextInput testID={this.props.testID} ref={ref => (this.refTextInput = ref)} placeholder={this.props.placeHolder} placeholderTextColor="rgba(239,239,239,0.7)" underlineColorAndroid="rgba(0,0,0,0)"
				// selectionColor="#FFF"
				secureTextEntry={!this.props.showCurrentPassword} onChangeText={value => {
					this.props._onChangeText(value, this.props.inputType)
				}} value={this.props.objPassword[this.props.inputType]} style={[dialogInputClone, { color: '#FFF', borderBottomColor: this.props.inputType !== 'email' ? this.props.linePassword[this.props.inputType] : 'rgba(239, 239, 239, 0.7)' }]} />
				<TouchableOpacity testID={`removeUsernameBtn`} style={[rightIcon, { borderBottomColor: this.props.inputType !== 'email' ? this.props.linePassword[this.props.inputType] : 'rgba(239, 239, 239, 0.7)' }]} activeOpacity={1} onPress={this.showPassword.bind(this)}>
					{this.props.inputType !== 'email'
						? <Icon style={{ opacity: this.props.showCurrentPassword ? 1 : 0.7, color: '#FFF' }} name={'md-eye'} size={16} />
						: <Icon style={[{ opacity: this.props.showCurrentPassword ? 1 : 0.7, color: '#FFF' }]} name={'md-close'} size={16} />
					}
				</TouchableOpacity>
			</View>
		)
	}
}
